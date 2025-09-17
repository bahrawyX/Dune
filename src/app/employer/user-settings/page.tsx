import { db } from '@/app/drizzle/db';
import { OrganizationUserSettingsTable } from '@/app/drizzle/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsForm } from '@/features/organizations/components/OrganizationNotificationForm';
import { getCurrentOrganization, getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import { Bell, Settings, Mail, Star, Users, TrendingUp } from 'lucide-react';

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
    <div className='max-w-5xl mx-auto py-8 space-y-6 px-4'>
      {/* Header */}
      <div className="mb-8">
        <div className=" gap-3 mb-2">
          <div className='flex items-center gap-3 mb-2'>
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
            <h1 className='text-3xl font-bold tracking-tight'>Notification Settings</h1>
            </div>
          <div>
            <p className="text-muted-foreground space-grotesk text-sm">Manage how you receive updates about your job listings and applications</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how you want to be notified about your job listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense  fallback={<Skeleton className='w-full h-32' />}>
                <SuspendedForm userId={userId} orgId={orgId} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Information Sidebar */}
        <div className="space-y-6">
          {/* Examples Panel */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">New Application</p>
                    <p className="text-muted-foreground text-xs">Get notified when someone applies to your job</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Quality Filter</p>
                    <p className="text-muted-foreground text-xs">Only notify for candidates meeting your rating</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <TrendingUp className="h-4 w-4 text-featured mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Daily Summaries</p>
                    <p className="text-muted-foreground text-xs">Receive consolidated updates at the end of each day</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
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
