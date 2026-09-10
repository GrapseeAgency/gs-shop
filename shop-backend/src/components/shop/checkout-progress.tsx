'use client'

import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutProgressProps {
  currentStep: 1 | 2 | 3
  steps?: string[]
}

export function CheckoutProgress({ 
  currentStep, 
  steps = ['Cart', 'Shipping', 'Payment'] 
}: CheckoutProgressProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = currentStep > stepNumber
          const isCurrent = currentStep === stepNumber
          const isUpcoming = currentStep < stepNumber

          return (
            <div key={step} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent && 'border-emerald-500 bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20',
                    isUpcoming && 'border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-600 dark:bg-slate-800'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isCompleted && 'text-emerald-600 dark:text-emerald-400',
                    isCurrent && 'text-emerald-600 dark:text-emerald-400',
                    isUpcoming && 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="mx-4 flex items-center">
                  <div
                    className={cn(
                      'h-0.5 w-16 transition-all duration-300',
                      isCompleted 
                        ? 'bg-emerald-500' 
                        : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  />
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 -ml-2',
                      isCompleted 
                        ? 'text-emerald-500' 
                        : 'text-slate-300 dark:text-slate-600'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
