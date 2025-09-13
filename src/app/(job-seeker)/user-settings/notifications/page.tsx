import { db } from '@/app/drizzle/db';
import { UserNotificationSettingsTable } from '@/app/drizzle/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationForm from '@/features/users/components/NotificationForm';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import { Form } from 'react-hook-form';

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
        <CardContent>
          <Suspense  fallback={<Skeleton className='w-full h-full' />}>
            <SuspendedForm userId={userId} />
          </Suspense>
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

  return <NotificationForm notificationSettings={settings} />
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
