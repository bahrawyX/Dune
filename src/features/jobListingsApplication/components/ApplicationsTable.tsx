"use client"
import { JobListingApplicationTable, UserResumeTable, UserTable } from '@/app/drizzle/schema'
import { DataTable } from '@/components/dataTable/DataTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ColumnDef } from '@tanstack/react-table'
import React, { ReactNode } from 'react'


type Application = Pick<
  typeof JobListingApplicationTable.$inferSelect,
  "createdAt" | "stage" | "rating" | "jobListingId"
> & {
  coverLetterMarkdown: ReactNode | null
  user: Pick<typeof UserTable.$inferSelect, "id" | "name" | "imageUrl"> & {
    resume:
      | (Pick<typeof UserResumeTable.$inferSelect, "resumeFileUrl"> & {
          markdownSummary: ReactNode | null
        })
      | null
  }
}


const ApplicationsTable = ({applications, canUpdateRating, canUpdateStage}: {applications: Application[], canUpdateRating: boolean, canUpdateStage: boolean}) => {
  return (
    <DataTable columns={getColumns(canUpdateRating, canUpdateStage)} data={applications} />
  )
}

export default ApplicationsTable

function getColumns(canUpdateRating: boolean, canUpdateStage: boolean) : ColumnDef<Application>[]{
    return [
        {
            accessorFn: (row) => row.user.name,
            header: 'Name',
            cell:({row})=>{
                const user = row.original.user
                const nameInitials = user.name ?? ""
                    .split(" ")
                    .slice(0, 2)
                    .map(name => name.charAt(0).toUpperCase())
                    .join("")
                    return (
                        <div className="flex items-center gap-2">
                          <Avatar className="rounded-full size-6">
                            <AvatarImage src={user.imageUrl ?? undefined} alt={user.name ?? ""} />
                            <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xs">
                              {nameInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      )


            }
        }
    ]

}
export const SkeletonApplicationsLoader = () => {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
        </div>
    )
}