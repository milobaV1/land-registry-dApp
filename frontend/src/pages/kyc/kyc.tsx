import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { usePinataUpload } from "@/hooks/usePinataUpload";
import type { NINInterface } from "@/service/interface/nin.interface";
import { verifyNIN } from "./api/nin";

//Remeber to do all the proper checks
const formSchema = z.object({
    nin: z.string().min(11).max(11),
    picture: z.any()
})

export function KYC(){
    const { upload, uploadStatus, link } = usePinataUpload()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nin: "",
            picture: null,
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>){
        console.log(values)
        const {nin, picture} = values
        const returnInfo = upload(picture)
        // const data: NINInterface = {
        //     nin: nin,
        //     dob: "safe",
        //     firstname: "Michael",
        //     lastname: "Iloba"
        // }
        // const response = await verifyNIN(data)
        // console.log("NIN API response: ",response);
        toast(`Done KYC: ${nin}`)
        return returnInfo
    }
    return(
        <div className="flex items-center justify-center w-full h-[100vh] bg-[#338e64] mt-5">
            <div className="bg-white w-[50rem] h-[50rem] border rounded-lg shadow-lg py-5 px-8">
                <div>
                    <p className="text-[50px] font-bold">KYC Verification</p>
                    <p className="text-[#7a7473] text-[20px]">Complete your identity verification to access land registration services</p>
                </div>
                <div className="pl-10 py-5">
                    <p className="text-[20px] font-medium">KYC Status: Not Started</p>
                    <p className="text-[#7a7473] text-[15px]">Please complete the form below to start your identity verification process</p>
                </div>
                <div className="mt-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="nin"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-[30px]">National ID Number (NIN)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your 11-digit NIN" {...field}/>
                                    </FormControl>
                                    <FormDescription>
                                        Your National Identification Number as issued by NIMC
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormItem>
                            <FormLabel className="text-[30px]">Upload Image</FormLabel>
                            <FormControl>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    form.setValue("picture", file);
                                }
                                }}
                            />
                            </FormControl>
                            <FormDescription>
                                Upload an image of yourself
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        <div className="flex flex-col border rounded-lg p-4">
                                <p className="font-bold text-[15px]">Important Information</p>
                                <span className="flex flex-col text-[12px]">
                                    <p>• All documents must be clear and readable</p>
                                    <p>• Documents should not be older than 3 months</p>
                                    <p>• Processing time is typically 24-48 hours</p>
                                    <p>• You will be notified via email once verification is complete</p>
                                    <p>• Ensure all information matches your official documents</p>
                                </span>
                        </div>
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
                </div>
            </div>
        </div>
    )
}