"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Star } from 'lucide-react'

export default function SimpleDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black p-8">
      <div className="container mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Simple Animation Test
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Testing basic framer-motion and component imports
          </p>
        </motion.div>

        {/* Simple Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Components</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="default">
              <Play className="w-4 h-4" />
              Primary Button
            </Button>
            <Button variant="outline">
              <Star className="w-4 h-4" />
              Outline Button
            </Button>
          </div>
        </section>

        {/* Simple Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Test Card 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This is a simple card component test</p>
              </CardContent>
            </Card>
            <motion.div
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-lg font-semibold mb-2">Animated Card</h3>
              <p className="text-muted-foreground">This card uses framer-motion directly</p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}