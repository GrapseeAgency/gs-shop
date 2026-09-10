'use client'

import { useState } from 'react'
import { Play, Clock, BookOpen, ShoppingCart, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function CoursesPage() {
  const [courses] = useState([
    { id: 1, name: 'Build E-commerce in 10 Hours', price: 2999, duration: '10h', lessons: 45, students: 1234, rating: 4.9, level: 'Intermediate' },
    { id: 2, name: 'DevOps Zero to Hero', price: 1999, duration: '8h', lessons: 32, students: 892, rating: 4.8, level: 'Beginner' },
    { id: 3, name: 'Figma Mastery for UI/UX', price: 1499, duration: '6h', lessons: 28, students: 1567, rating: 4.7, level: 'All Levels' },
    { id: 4, name: 'React Performance Optimization', price: 999, duration: '3h', lessons: 15, students: 678, rating: 4.9, level: 'Advanced' },
  ])

  const buyCourse = (course: any) => {
    toast.success(`${course.name} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Play className="h-10 w-10 text-red-600" />
          Video Courses
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Learn from industry experts. Lifetime access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="group hover:shadow-xl transition-all">
            <div className="h-48 bg-gradient-to-br from-red-100 to-orange-100 rounded-t-lg flex items-center justify-center">
              <Play className="h-16 w-16 text-red-600" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline">{course.duration}</Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">{course.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{course.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-600">{course.price}</p>
                <Button onClick={() => buyCourse(course)}>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Enroll
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
