import { OrganizationList } from "@clerk/nextjs"

type Props = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function OrganizationSelectPage({ searchParams }: Props) {
  const { redirect } = await searchParams
  const redirectUrl = redirect ?? "/employer"

  return (
    <OrganizationList
      hidePersonal
      hideSlug
      skipInvitationScreen
      afterSelectOrganizationUrl={redirectUrl}
      afterCreateOrganizationUrl={redirectUrl}
    />
  )
}