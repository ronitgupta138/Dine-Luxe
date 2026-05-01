﻿"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Button } from "@/components/ui/button"
import { Camera, QrCode, RefreshCw, Utensils } from "lucide-react"

export default function CustomerScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
    } catch (err) {
      setHasPermission(false)
      setError("Camera permission denied. Please allow camera access to scan QR codes.")
    }
  }

  const startScanning = () => {
    setIsScanning(true)
    setError(null)
    
    // Mock scanning - in real app, use a QR code library
    setTimeout(() => {
      // Simulate successful scan
      router.push("/customer/menu")
    }, 3000)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  return (
    <PageWrapper title="Scan QR Code" subtitle="Scan the restaurant's QR code to view menu">
      <div className="space-y-6">
        {/* Scanner View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-gray-900"
        >
          {isScanning ? (
            <>
              {/* Camera placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white/30 rounded-xl" />
              </div>
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scaleX: [0.9, 1, 0.9],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-56 h-56 border-2 border-brand-primary rounded-xl"
                />
              </div>

              {/* Scan line animation */}
              <motion.div
                animate={{ y: [0, 200, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute left-4 right-4 h-0.5 bg-brand-primary"
              />

              {/* Instructions */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white text-sm">Align QR code within the frame</p>
              </div>

              {/* Cancel button */}
              <button
                onClick={stopScanning}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <QrCode size={48} className="text-white" />
              </div>
              <p className="text-white text-center mb-2">Point camera at QR code</p>
              <p className="text-white/60 text-sm text-center">
                The QR code is usually on your table or displayed at the entrance
              </p>
            </div>
          )}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Permission denied state */}
        {hasPermission === false && !isScanning && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Camera permission is required to scan QR codes
            </p>
            <Button
              onClick={checkCameraPermission}
              variant="outline"
            >
              <RefreshCw size={16} className="mr-2" />
              Request Permission
            </Button>
          </div>
        )}

        {/* Manual entry option */}
        {!isScanning && (
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">Having trouble scanning?</p>
            <Button
              onClick={() => router.push("/customer/menu")}
              variant="ghost"
            >
              Enter restaurant code manually
            </Button>
          </div>
        )}

        {/* Scan button */}
        {hasPermission && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={startScanning}
              className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-lg rounded-xl"
            >
              <Camera size={20} className="mr-2" />
              {hasPermission === null ? "Checking camera..." : "Start Scanning"}
            </Button>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-xl p-4"
        >
          <h3 className="font-medium text-gray-900 mb-2">Scanning Tips</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Hold your phone steady while scanning</li>
            <li>• Make sure the QR code is well-lit</li>
            <li>• Clean your camera lens for better scanning</li>
            <li>• The QR code should fill about 30% of the screen</li>
          </ul>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
