'use client'

import { useState } from 'react'
import { Award, CheckCircle, Shield, FileCode, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function QualityCertificatePage() {
  const [certificate] = useState({
    projectName: 'E-commerce Website',
    score: 92,
    checks: [
      { name: 'Code Quality', score: 95, passed: true },
      { name: 'Security Scan', score: 88, passed: true },
      { name: 'Performance', score: 94, passed: true },
      { name: 'Accessibility', score: 91, passed: true },
      { name: 'SEO', score: 89, passed: true },
      { name: 'Test Coverage', score: 87, passed: true }
    ],
    vulnerabilities: 0,
    testCoverage: '87%',
    linesOfCode: 12450
  })

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Award className="h-10 w-10 text-yellow-600" />
          Code Quality Certificate
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Verified quality for every delivered project
        </p>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-8 text-center">
          <Award className="h-20 w-20 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-3xl font-bold mb-2">Quality Certificate</h2>
          <p className="text-xl text-muted-foreground mb-4">{certificate.projectName}</p>
          <div className="inline-block bg-white px-6 py-3 rounded-lg shadow">
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className="text-5xl font-bold text-green-600">{certificate.score}/100</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{certificate.vulnerabilities}</p>
            <p className="text-sm text-muted-foreground">Security Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileCode className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{certificate.testCoverage}</p>
            <p className="text-sm text-muted-foreground">Test Coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold">{certificate.linesOfCode.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Lines of Code</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Checks</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {certificate.checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{check.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={check.score} className="h-2" />
                  </div>
                  <Badge className={check.score >= 90 ? 'bg-green-500' : check.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'}>
                    {check.score}/100
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button size="lg">
          <Award className="h-4 w-4 mr-2" />
          Download Certificate PDF
        </Button>
      </div>
    </div>
  )
}
