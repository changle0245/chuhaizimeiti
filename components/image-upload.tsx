'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  disabled?: boolean
}

export default function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        const preview = URL.createObjectURL(file)
        onImageSelect(file, preview)
      }
    },
    [onImageSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      {isDragActive ? (
        <p className="text-lg text-blue-600">Drop your image here...</p>
      ) : (
        <div>
          <p className="text-lg font-medium mb-2">
            Drag & drop your product image here
          </p>
          <p className="text-sm text-gray-500 mb-2">or click to browse</p>
          <p className="text-xs text-gray-400">
            Supports: PNG, JPG, JPEG, WEBP (Max 10MB)
          </p>
        </div>
      )}
    </div>
  )
}
