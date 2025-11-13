import { inngest } from './client'
import { createClient } from '@/lib/supabase/server'
import { identifyProduct, generateMarketingCopy, generateBackgroundPrompt } from '@/lib/ai/openai'
import { removeBackground } from '@/lib/ai/removebg'
import { generateBackground } from '@/lib/ai/stability'
import { generateVideo } from '@/lib/ai/shotstack'
import { uploadToR2, generateStorageKey } from '@/lib/storage/r2'

export const processProject = inngest.createFunction(
  { id: 'process-project', name: 'Process Marketing Project' },
  { event: 'project/process' },
  async ({ event, step }) => {
    const { projectId, userId, originalImageUrl, settings } = event.data

    const supabase = await createClient()

    // Step 1: Identify product
    const productInfo = await step.run('identify-product', async () => {
      try {
        const info = await identifyProduct(originalImageUrl)

        await supabase
          .from('projects')
          .update({ status: 'processing' })
          .eq('id', projectId)

        return info
      } catch (error: any) {
        await supabase
          .from('projects')
          .update({
            status: 'failed',
            error_message: `Product identification failed: ${error.message}`
          })
          .eq('id', projectId)
        throw error
      }
    })

    // Step 2: Remove background
    const backgroundRemovedUrl = await step.run('remove-background', async () => {
      try {
        const bgRemovedBuffer = await removeBackground(originalImageUrl)
        const storageKey = generateStorageKey(userId, 'no-bg.png', 'processed')
        const url = await uploadToR2(bgRemovedBuffer, storageKey, 'image/png')

        await supabase
          .from('projects')
          .update({ background_removed_url: url })
          .eq('id', projectId)

        return url
      } catch (error: any) {
        await supabase
          .from('projects')
          .update({
            status: 'failed',
            error_message: `Background removal failed: ${error.message}`
          })
          .eq('id', projectId)
        throw error
      }
    })

    // Step 3: Generate background (if not plain)
    const processedImageUrl = await step.run('generate-background', async () => {
      try {
        let backgroundPrompt = settings.customBackgroundPrompt

        // Generate prompt if auto or specific style
        if (settings.backgroundStyle === 'auto' || !backgroundPrompt) {
          const style = settings.backgroundStyle === 'auto' ? 'modern' : settings.backgroundStyle
          backgroundPrompt = await generateBackgroundPrompt(productInfo, style)
        }

        // Generate background image
        const backgroundBuffer = await generateBackground(backgroundPrompt!)
        const storageKey = generateStorageKey(userId, 'with-bg.png', 'processed')
        const url = await uploadToR2(backgroundBuffer, storageKey, 'image/png')

        await supabase
          .from('projects')
          .update({ processed_image_url: url })
          .eq('id', projectId)

        return url
      } catch (error: any) {
        await supabase
          .from('projects')
          .update({
            status: 'failed',
            error_message: `Background generation failed: ${error.message}`
          })
          .eq('id', projectId)
        throw error
      }
    })

    // Step 4: Generate marketing copy
    const marketingCopy = await step.run('generate-copy', async () => {
      try {
        const copy: { english?: string; arabic?: string } = {}

        if (settings.languages.includes('english')) {
          copy.english = await generateMarketingCopy(productInfo, 'english')
        }

        if (settings.languages.includes('arabic')) {
          copy.arabic = await generateMarketingCopy(productInfo, 'arabic')
        }

        await supabase
          .from('projects')
          .update({
            copy_english: copy.english,
            copy_arabic: copy.arabic,
          })
          .eq('id', projectId)

        return copy
      } catch (error: any) {
        await supabase
          .from('projects')
          .update({
            status: 'failed',
            error_message: `Copy generation failed: ${error.message}`
          })
          .eq('id', projectId)
        throw error
      }
    })

    // Step 5: Generate video
    const videoUrl = await step.run('generate-video', async () => {
      try {
        const url = await generateVideo(
          processedImageUrl,
          settings.videoDuration,
          settings.includeMusic
        )

        await supabase
          .from('projects')
          .update({ video_url: url })
          .eq('id', projectId)

        return url
      } catch (error: any) {
        await supabase
          .from('projects')
          .update({
            status: 'failed',
            error_message: `Video generation failed: ${error.message}`
          })
          .eq('id', projectId)
        throw error
      }
    })

    // Step 6: Mark as completed
    await step.run('mark-completed', async () => {
      await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', projectId)

      // Log usage
      await supabase.from('usage_logs').insert({
        user_id: userId,
        project_id: projectId,
        action_type: 'project_completed',
        api_calls: {
          openai: 3, // identify + 2x copy generation
          removebg: 1,
          stability: 1,
          shotstack: 1,
        },
      })
    })

    return {
      success: true,
      projectId,
      productInfo,
      backgroundRemovedUrl,
      processedImageUrl,
      marketingCopy,
      videoUrl,
    }
  }
)
