import { db } from '@/app/drizzle/db';
import { UserNotificationSettingsTable } from '@/app/drizzle/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsForm } from '@/features/users/components/NotificationForm';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import { Form } from 'react-hook-form';
import { Bell, Mail, Sparkles } from 'lucide-react';

const NotificationPage = () => {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  )
}

export default NotificationPage


async function SuspendedComponent() {
  const {userId} = await getCurrentUser();
  if(userId == null) {
    return notFound()
  }
  return (
    <div className='max-w-3xl mx-auto py-8 space-y-6 px-4'>
      <h1 className='text-2xl font-bold mb-4 tracking-tight'>Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><Bell className='w-5 h-5'/> Daily job email</CardTitle>
          <CardDescription className='space-grotesk text-muted-foreground'>Get one digest per day with listings that match your interests.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <Suspense  fallback={<Skeleton className='w-full h-full' />}>
            <SuspendedForm userId={userId} />
          </Suspense>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border p-3 text-sm space-y-2'>
              <div className='flex items-center gap-2 text-foreground'><Sparkles className='w-4 h-4'/> Prompt examples</div>
              <ul className='list-disc pl-5 space-y-1 text-muted-foreground text-xs'>
                <li>Remote React roles with TypeScript, EST timezone.</li>
                <li>Data analyst positions using SQL/Python, fintech.</li>
                <li>AI/ML roles focused on RAG/vector search.</li>
              </ul>
            </div>
            <div className='rounded-lg border p-3'>
              <div className='flex items-center gap-2 text-sm font-medium mb-2'><Mail className='w-4 h-4'/> Preview</div>
              <div className='rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground'>
                <div className='font-medium text-foreground mb-1'>Your daily matches</div>
                <div>3 jobs that match: “Remote React roles with TypeScript, EST timezone.”</div>
                <ul className='mt-2 space-y-1'>
                  <li>• Frontend Engineer — Acme</li>
                  <li>• React Developer — Northwind</li>
                  <li>• UI Engineer — Contoso</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function SuspendedForm({userId}:{userId:string}) {
  const notificationSettings = await getUserNotificationSettings(userId);

  // Provide default values if no settings found
  const settings = notificationSettings ?? {
    newJobEmailNotifications: false,
    aiPrompt: null
  };

  return <NotificationsForm notificationSettings={settings} />
}

async function getUserNotificationSettings(userId: string) {
  return await db.query.UserNotificationSettingsTable.findFirst({
    where: eq(UserNotificationSettingsTable.userId, userId),
    columns: {
      newJobEmailNotifications: true,
      aiPrompt: true,
    },
  });
}
