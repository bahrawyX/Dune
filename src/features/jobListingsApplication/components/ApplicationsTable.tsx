"use client"
import { ApplicationStage, applicationStages, JobListingApplicationTable, UserResumeTable, UserTable } from '@/app/drizzle/schema'
import { DataTableColumnHeader } from '@/components/dataTable/data-table-column-header'
import { DataTable } from '@/components/dataTable/DataTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/components/dataTable/DataTablePagination'
import { ColumnDef, Table as TableType } from '@tanstack/react-table'
import React, { ComponentType, ReactNode, useOptimistic, useState, useTransition } from 'react'
import { sortApplicationsByStage } from '../lib/utils'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StageIcon } from './StageIcon'
import { formatJobListingApplicationStage } from '../lib/formatters'
import { DropdownMenu, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronDownIcon, EyeOffIcon, MoreHorizontalIcon } from 'lucide-react'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { updateJobListingApplicationRating, updateJobListingApplicationStage } from '../actions/actions'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialogDescription, AlertDialogHeader } from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { RatingIcons } from './RatingIcons'
import { RATING_OPTIONS } from '../data/constants'
import { DataTableFacetedFilter } from '@/components/dataTable/DataTableFacetedFilter'


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


const ApplicationsTable = ({applications, canUpdateRating, canUpdateStage, toolbarComponent, noResultsMessage = "No applications found.", isLoading = false}: {applications: Application[], canUpdateRating: boolean, canUpdateStage: boolean, toolbarComponent?: ComponentType<{table: TableType<Application>}>, noResultsMessage?: ReactNode, isLoading?: boolean}) => {
  if (isLoading) {
    return <SkeletonApplicationsLoader />
  }

  return (
    <DataTable columns={getColumns(canUpdateRating, canUpdateStage)} data={applications}
      noResultsMessage={noResultsMessage}
      ToolbarComponent={Toolbar}
    />
  )
}
  function Toolbar({table}: {table: TableType<Application>}) {
   const hiddenRows = table.getCoreRowModel().rows.length - table.getRowCount();
 
   return <div className='flex gap-2 items-center'>
     {
       table.getColumn("stage") && (
         <DataTableFacetedFilter 
           column={table.getColumn("stage")} 
           title="Stage" 
           options={applicationStages.toSorted().map(stage => ({label: formatJobListingApplicationStage(stage), value: stage, key: stage}))} 
         />
       )
     }
     {
       table.getColumn("rating") && (
         <DataTableFacetedFilter 
           column={table.getColumn("rating")} 
           title="Rating" 
           options={RATING_OPTIONS.map(rating => ({label: rating?.toString() ?? "No Rating", value: rating, key: rating?.toString() ?? "null"}))} 
         />
       )
     }
     {
       hiddenRows > 0 && (
         <Button variant="outline" size="sm">
           <EyeOffIcon className="size-4" />
           {hiddenRows} hidden
         </Button>
       )
     }
   </div>
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
        },{
          accessorKey: "stage",
          header: ({column})=>{
            return <DataTableColumnHeader column={column} title="Stage" />
          },
          sortingFn: (rowA, rowB, columnId) => {
            return sortApplicationsByStage(rowA.original.stage, rowB.original.stage)
          },
          filterFn:(row, id, value) => {
            return value.includes(row.original.stage)
          },
          cell:({row})=>{
            return <StageCell canUpdateStage={canUpdateStage} stage={row.original.stage} jobListingId={row.original.jobListingId} userId={row.original.user.id}  />
          }
        },
        {
          accessorKey: "rating",
          header: ({ column }) => (
            <DataTableColumnHeader title="Rating" column={column} />
          ),
          filterFn: ({ original }, _, value) => {
            return value.includes(original.rating)
          },
          cell: ({ row }) => (
            <RatingCell
              canUpdate={canUpdateRating}
              rating={row.original.rating}
              jobListingId={row.original.jobListingId}
              userId={row.original.user.id}
            />
          ),
        },
        {
          accessorKey: "createdAt",
          accessorFn: row => row.createdAt,
          header: ({ column }) => (
            <DataTableColumnHeader title="Applied On" column={column} />
          ),
          cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
        },
        {
          id: "actions",
          cell: ({ row }) => {
            const jobListing = row.original
            const resume = jobListing.user.resume
            console.log("resume " +resume , "jobListing " + jobListing)
            return (
              <ActionCell
                coverLetterMarkdown={jobListing.coverLetterMarkdown}
                resumeMarkdown={ resume?.markdownSummary}
                resumeUrl={resume?.resumeFileUrl}
                userName={jobListing.user.name ?? ""}
              />
            )
          },  
        }
      ]

}
export const SkeletonApplicationsLoader = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Applied On</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 items-center">
                                        <Skeleton className="h-5 w-5" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <SkeletonPagination />
        </div>
    )
}

function SkeletonPagination() {
    return (
        <div className="flex items-center justify-between px-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    )
}

function StageCell({canUpdateStage, stage, jobListingId, userId}: {canUpdateStage: boolean, stage: ApplicationStage, jobListingId: string, userId: string}) {
  const [optimisticStage, setOptimisticStage] = useOptimistic(stage);
  const [isPending, startTransition] = useTransition();


  if(!canUpdateStage) {
    return <StageDetail stage={optimisticStage} />
  }

  return <DropdownMenu>
    <DropdownMenuTrigger asChild> 
      <Button variant="ghost" className={cn("-ml-3" ,isPending && "opacity-50" )}>  
        <StageDetail stage={optimisticStage} />
        <ChevronDown className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {applicationStages.toSorted().map((stage) => (
        <DropdownMenuItem key={stage} onClick={ () => {
          startTransition(async () => {
            const originalStage = optimisticStage;
            setOptimisticStage(stage)
            const res = await updateJobListingApplicationStage({jobListingId, userId}, stage)
            
            if (res?.error) {
              // Revert optimistic update on error
              setOptimisticStage(originalStage);
              toast.error(res.message || "Failed to update application stage");
            } else {
              toast.success("Application stage updated successfully");
            }
          })

        }}>
          <StageDetail stage={stage} />
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>

}

function StageDetail({stage}: {stage: ApplicationStage}) {
  return <div className='flex gap-2 items-center'>
    <StageIcon stage={stage}  className="size-5 text-inherit"/>
    <div>
      {formatJobListingApplicationStage(stage)}
    </div>
  </div>
}
function RatingCell({
  rating,
  jobListingId,
  userId,
  canUpdate,
}: {
  rating: number | null
  jobListingId: string
  userId: string
  canUpdate: boolean
}) {
  const [optimisticRating, setOptimisticRating] = useOptimistic(rating)
  const [isPending, startTransition] = useTransition()

  if (!canUpdate) {
    return <RatingIcons rating={optimisticRating} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <RatingIcons rating={optimisticRating} />
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {RATING_OPTIONS.map(ratingValue => (
          <DropdownMenuItem
            key={ratingValue ?? "none"}
            onClick={() => {
              startTransition(async () => {
                const originalRating = optimisticRating;
                setOptimisticRating(ratingValue)
                const res = await updateJobListingApplicationRating(
                  {
                    jobListingId,
                    userId,
                  },
                  ratingValue
                )

                if (res?.error) {
                  // Revert optimistic update on error
                  setOptimisticRating(originalRating);
                  toast.error(res.message || "Failed to update application rating");
                } else {
                  toast.success("Application rating updated successfully");
                }
              })
            }}
          >
            <RatingIcons rating={ratingValue} className="text-inherit" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ActionCell({
  resumeUrl,
  userName,
  resumeMarkdown,
  coverLetterMarkdown,
}: {
  resumeUrl: string | null | undefined
  userName: string
  resumeMarkdown: ReactNode | null
  coverLetterMarkdown: ReactNode | null
}) {
  const [openModal, setOpenModal] = useState<"resume" | "coverLetter" | null>(
    null
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {resumeUrl != null || resumeMarkdown != null ? (
            <DropdownMenuItem onClick={() => setOpenModal("resume")}>
              View Resume
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Resume
            </DropdownMenuLabel>
          )}
          {coverLetterMarkdown ? (
            <DropdownMenuItem onClick={() => setOpenModal("coverLetter")}>
              View Cover Letter
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Cover Letter
            </DropdownMenuLabel>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {coverLetterMarkdown && (
        <Dialog
          open={openModal === "coverLetter"}
          onOpenChange={o => setOpenModal(o ? "coverLetter" : null)}
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Cover Letter</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{coverLetterMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
      {(resumeMarkdown || resumeUrl) && (
        <Dialog
          open={openModal === "resume"}
          onOpenChange={o => setOpenModal(o ? "resume" : null)}
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Resume</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
              {resumeUrl && (
                <Button asChild className="self-start">
                  <Link
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Original Resume
                  </Link>
                </Button>
              )}
              <DialogDescription className="mt-2">
                This is an AI-generated summary of the applicant&apos;s resume
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{resumeMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

