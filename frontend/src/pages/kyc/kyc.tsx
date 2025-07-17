'use client';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { usePinataUpload } from "@/hooks/usePinataUpload";
import { CalendarIcon } from 'lucide-react'
import type { NINInterface, UserInterface } from "@/service/interface/nin.interface";
import { verifyNIN } from "./api/nin";
import { useKYCState } from "@/store/kyc.store";
import { useEffect, useState } from "react";
import { useAuthState } from "@/store/auth.store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns/format";
import { createUser } from "./api/kyc";
import { useKYCContract } from "@/hooks/useKYCContract";
import bcrypt from 'bcryptjs'
import { useNavigate } from "@tanstack/react-router";

//Remeber to do all the proper checks
const formSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
     dob: z.coerce.date({
        required_error: 'Please enter your date of birth',
    }),
    nin: z.string().min(11).max(11),
    picture: z.any()
})

export function KYC(){
    const { upload, uploadStatus, link} = usePinataUpload()
    const navigate = useNavigate()
    const { firstname, lastname, dob, nin, picture, status, setKYC, resetKYC } = useKYCState();
    const { address } = useAuthState()
    const { submitKYC, hash, isPending, isConfirming, isSuccess, error } = useKYCContract()
    const [date, setDate] = useState<Date>();
    const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      form.setValue('dob', selectedDate); // Sync selected date with form state
    }
  };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            dob: new Date() || undefined,
            nin: "",
            picture: null,
        }
    })
      useEffect(() => {
    form.reset({
      firstname: firstname || "",
      lastname: lastname || "",
      dob: dob || undefined,
      nin: nin || "",
      picture: picture || null,
    });
  }, [firstname, lastname, dob, nin, picture]);

  // Sync form values to Zustand on every change
 useEffect(() => {
  const subscription = form.watch((value) => {
    // Only update Zustand if values differ
    if (
      value.firstname !== firstname ||
      value.lastname !== lastname ||
      value.dob !== dob ||
      value.nin !== nin ||
      value.picture !== picture
    ) {
      setKYC({
        firstname: value.firstname,
        lastname: value.lastname,
        dob: value.dob,
        nin: value.nin,
        picture: value.picture,
      });
    }
  });
  return () => subscription.unsubscribe();
}, [form, setKYC, firstname, lastname, dob, nin, picture]);


     const handleChange = (field: keyof typeof formSchema.shape) => (value: any) => {
    setKYC({ [field]: value });
  };
    async function onSubmit(values: z.infer<typeof formSchema>){
        // console.log(values)
        const {firstname, lastname, dob, nin, picture} = values
        console.log("Type of firstname: ", typeof firstname)
        console.log("Type of lastname: ", typeof lastname)
        console.log("Type of dob: ", typeof dob)
        console.log("Type of nin: ", typeof nin)
        console.log("Type of picture: ", typeof picture)
        console.log("Type of address: ", typeof address)
        setKYC({ status: "verified" });
        const hashedNIN = await bcrypt.hash(nin.trim(), 10)
        const returnInfo = await upload(picture)
        //console.log("Return Info: ", returnInfo)
        const data: UserInterface = {
            wallet_address: address,
            firstName: firstname,
            lastName: lastname,
            dob,
            nin: hashedNIN,
            kycstatus: "verified"
        }
        
        // const response = await verifyNIN(data)
        // console.log("NIN API response: ",response);

        const response = await createUser(data)
        if (!address) {
            toast("Wallet address is required for KYC submission.");
            return;
        }
        if (returnInfo) {
            submitKYC(address, hashedNIN, returnInfo)
            if(isPending) console.log("Pending...")
            if(error) console.log("Error: ", error)
            if(isSuccess) console.log("Success")  
        }
        //Store pic in IPFS, store CID on-chain, store the rest off-chain
        toast(`Done KYC: ${nin}`)
        setKYC({ status: "verified" });
        resetKYC()
        navigate({to: '/'})
        return { returnInfo, response }
    }
    return (
        <div className="flex items-center justify-center w-full h-[100vh] bg-[#338e64] mt-5">
            <div className="bg-white w-[50rem] h-[50rem] border rounded-lg shadow-lg py-5 px-8 overflow-auto">
                <div>
                    <p className="text-[50px] font-bold">KYC Verification</p>
                    <p className="text-[#7a7473] text-[20px]">
                        Complete your identity verification to access land registration services
                    </p>
                </div>
                <div className="pl-10 py-5">
                    <p className="text-[20px] font-medium">KYC Status: Not Started</p>
                    <p className="text-[#7a7473] text-[15px]">
                        Please complete the form below to start your identity verification process
                    </p>
                </div>
                <div className="mt-5">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Firstname */}
                            <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your first name" {...field} onChange={(e) => {
                                                field.onChange(e);
                                                handleChange('firstname')(e.target.value);
                                            }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Lastname */}
                            <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your last name" {...field} onChange={(e) => {
                                                field.onChange(e);
                                                handleChange('lastname')(e.target.value);
                                            }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* DOB 
                            <FormField
                                control={form.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                                onChange={(e) => 
                                                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />*/}
                            {/* Second DOB*/}
                             <FormField
                                control={form.control}
                                name="dob"
                                render={() => (
                                <FormItem>
                                    <FormLabel>
                                    Date of Birth
                                    </FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button className="w-[90%] justify-start text-left font-normal border-slate-200 border rounded-l hover:bg-gray-50 hover:text-black hover:border-transparent bg-white text-slate-600 text-muted-foreground">
                                            <CalendarIcon size={20} className="w-4 h-4 mr-2 " />
                                            {date ? format(date, 'MM/dd/yyyy') : 'Please select a date'}
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleDateSelect}
                                        className="text-black bg-white shadow-2xl"
                                        />
                                    </PopoverContent>
                                    <FormMessage />
                                    </Popover>
                                </FormItem>
                                )}
                            />
                            {/* NIN */}
                            <FormField
                                control={form.control}
                                name="nin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>National ID Number (NIN)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your 11-digit NIN" {...field} onChange={(e) => {
                                                field.onChange(e);
                                                handleChange('nin')(e.target.value);
                                            }}/>
                                        </FormControl>
                                        <FormDescription>
                                            Your National Identification Number as issued by NIMC
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Picture Upload */}
                            <FormItem>
                                <FormLabel>Upload Image</FormLabel>
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
                                <FormDescription>Upload an image of yourself</FormDescription>
                               <FormMessage/>
                            </FormItem>

                            {/* Important Info */}
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
                            <Button type="submit" disabled={uploadStatus === "uploading"}>
                                {uploadStatus === "uploading" ? "Uploading..." : "Submit"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}