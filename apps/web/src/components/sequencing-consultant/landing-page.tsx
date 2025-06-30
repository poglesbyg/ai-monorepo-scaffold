'use client'

import { motion } from 'framer-motion'
import { 
  Dna, 
  FlaskConical, 
  Zap, 
  CheckCircle,
  ArrowRight,
  MessageSquare,
  DollarSign
} from 'lucide-react'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function SequencingLandingPage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI-Powered Consultation',
      description: 'Get personalized recommendations based on your research needs'
    },
    {
      icon: FlaskConical,
      title: 'Comprehensive Services',
      description: 'RNA-seq, DNA-seq, ChIP-seq, Single Cell, and more'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'Get cost estimates upfront based on your project scope'
    },
    {
      icon: Zap,
      title: 'Fast Turnaround',
      description: 'Optimized workflows for quick and reliable results'
    }
  ]

  const services = [
    {
      title: 'RNA Sequencing',
      description: 'Gene expression profiling and transcriptome analysis',
      applications: ['Differential expression', 'Pathway analysis', 'Biomarker discovery']
    },
    {
      title: 'Whole Genome Sequencing',
      description: 'Complete genome coverage for variant discovery',
      applications: ['SNP/Indel calling', 'Structural variants', 'Copy number analysis']
    },
    {
      title: 'ChIP-Seq',
      description: 'Protein-DNA interaction mapping',
      applications: ['Transcription factors', 'Histone modifications', 'Chromatin accessibility']
    },
    {
      title: 'Single Cell RNA-Seq',
      description: 'Cell-type specific expression profiling',
      applications: ['Cell clustering', 'Trajectory analysis', 'Cell communication']
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Tell us about your project',
      description: 'Fill out our consultation form with your research details'
    },
    {
      number: '2',
      title: 'Get AI recommendations',
      description: 'Our AI analyzes your needs and suggests optimal services'
    },
    {
      number: '3',
      title: 'Review and submit',
      description: 'Review recommendations and submit your consultation'
    },
    {
      number: '4',
      title: 'Expert follow-up',
      description: 'Our team contacts you to finalize your sequencing plan'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              High-Throughput Sequencing Services
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Let our AI consultant help you find the perfect sequencing solution for your research. 
              Get personalized recommendations in minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.location.href = '/consultation'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Services
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Dna className="w-96 h-96 text-blue-100 opacity-20" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our Sequencing Facility?
            </h2>
            <p className="text-lg text-gray-600">
              State-of-the-art technology combined with expert guidance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Icon className="w-10 h-10 text-blue-600 mb-2" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Sequencing Services
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive solutions for all your genomics research needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold mb-2">Applications:</p>
                    <ul className="space-y-1">
                      {service.applications.map((app) => (
                        <li key={app} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started with your sequencing project in 4 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Sequencing Project?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our AI consultant is here to guide you through the process
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.location.href = '/consultation'}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Free Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © 2024 High-Throughput Sequencing Facility. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
} 