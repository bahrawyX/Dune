import { db } from '@/app/drizzle/db';
import { OrganizationUserSettingsTable } from '@/app/drizzle/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsForm } from '@/features/organizations/components/OrganizationNotificationForm';
import { getCurrentOrganization, getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'

const EmployerUserSettingsPage = () => {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  )
}

export default EmployerUserSettingsPage


async function SuspendedComponent() {
  const {userId} = await getCurrentUser();
  const {orgId} = await getCurrentOrganization();
    if(userId == null || orgId == null) {
    return notFound()
  }
  return (
    <div className='max-w-3xl mx-auto py-8 space-y-6 px-4'>
      <h1 className='text-2xl font-bold mb-4 tracking-tight'>Notifications</h1>
      <Card>
        <CardContent>
          <Suspense  fallback={<Skeleton className='w-full h-full' />}>
            <SuspendedForm userId={userId} orgId={orgId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function SuspendedForm({userId, orgId}:{userId:string, orgId:string}) {
  const notificationSettings = await getUserNotificationSettings(userId, orgId);

  // Provide default values if no settings found
  const settings = notificationSettings ?? {
    newApplicationEmailNotifications: false,
    minimumRating: null
  };

  return <NotificationsForm notificationSettings={settings} />
}

async function getUserNotificationSettings(userId: string, orgId: string) {
  return await db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
        eq(OrganizationUserSettingsTable.userId, userId),
        eq(OrganizationUserSettingsTable.organizationId, orgId),
    ),
    columns: {
      newApplicationEmailNotifications: true,
      minimumRating: true,
    },

  });
}
