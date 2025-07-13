"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestBuild() {
  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-6"
      >
        <h1 className="text-3xl font-bold">Build Test Page</h1>
        <p className="text-muted-foreground">
          This page tests basic framer-motion and component imports.
        </p>
        
        <div className="space-y-4">
          <Button>Test Button</Button>
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Test Card</h2>
            <p>If you can see this page, the build is working correctly.</p>
          </Card>
        </div>
        
        <motion.div
          className="w-16 h-16 bg-blue-500 rounded-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  )
}