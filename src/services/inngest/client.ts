import { DeletedObjectJSON, OrganizationJSON, UserJSON } from "@clerk/nextjs/server";
import {EventSchemas, Inngest } from "inngest";
type ClerkWebHookData<T> = {
    data : {
        data : T;
        raw: string ,
        headers: Record<string, string>; 
    }
}
type Events = {
        "clerk/user.created" : ClerkWebHookData<UserJSON>
        "clerk/user.updated" : ClerkWebHookData<UserJSON>
        "clerk/user.deleted" : ClerkWebHookData<DeletedObjectJSON>
        "clerk/organization.created" : ClerkWebHookData<OrganizationJSON>
        "clerk/organization.updated" : ClerkWebHookData<OrganizationJSON>
        "clerk/organization.deleted" : ClerkWebHookData<DeletedObjectJSON>  
        "clerk/webhook_recieved " : { data: { raw: string, headers: Record<string, string> } }
}

export const inngest = new Inngest({
    id: "dune",
    schemas: new EventSchemas().fromRecord<Events>()
});