"use client"

export default function SimpleDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black p-8">
      <div className="container mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Simple Animation Test
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Testing basic animations and component imports
          </p>
        </div>

        {/* Simple Buttons */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Components</h2>
          <div className="flex gap-4 flex-wrap">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-all hover:scale-105">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21 5,3"></polygon>
              </svg>
              Primary Button
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-all hover:scale-105">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
              </svg>
              Outline Button
            </button>
          </div>
        </section>

        {/* Simple Cards */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Test Card 1</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground">This is a simple card component test</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
              <h3 className="text-lg font-semibold mb-2">Animated Card</h3>
              <p className="text-sm text-muted-foreground">This card uses CSS transitions for smooth animations</p>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Interactive Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm group cursor-pointer transition-all hover:shadow-xl hover:scale-105">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5,3 19,12 5,21 5,3"></polygon>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Start Quiz</h3>
                <p className="text-sm text-muted-foreground">Begin your learning journey</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm group cursor-pointer transition-all hover:shadow-xl hover:scale-105">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">View Results</h3>
                <p className="text-sm text-muted-foreground">Check your progress</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm group cursor-pointer transition-all hover:shadow-xl hover:scale-105">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5,3 19,12 5,21 5,3"></polygon>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Practice Mode</h3>
                <p className="text-sm text-muted-foreground">Improve your skills</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
