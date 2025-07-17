'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'; // Make sure you use a styled UI select
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { states } from '@/lib/states';
import { useEffect, useRef, useState } from 'react';
import { usePinataUpload } from '@/hooks/usePinataUpload';
import type { RegisterLand, RegisterLandOnChain } from '@/service/interface/land.interface';
import { useLandRegistry } from '@/hooks/useLandRegistryContract';
import { useAccount } from 'wagmi';
import { registerLandOffChain } from './api/register';
import { useAuthState } from '@/store/auth.store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Eye, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns/format';
import { useNavigate } from '@tanstack/react-router';

const formSchema = z.object({
  cOfONo: z.string().regex(/^\d{2}\|\d{2}\|\d{4}[A-Z]{2}$/, {
    message: "C of O number must be in format: 12|34|5678AB"
  }),
  landAddress: z.string().min(10, {
    message: "Address must be at least 10 characters long"
  }),
  dateOfIssuance: z.coerce.date({
    required_error: 'Date of Issuance is required',
  }),
  state: z.string(),
  lga: z.string(),
  area: z.coerce.number().min(1),
  landuse: z.enum(['residential', 'industrial']),
  picture: z.any()
});

export function Register() {
  const { upload, uploadStatus } = usePinataUpload()
  const { address, isConnected } = useAccount() 
  const navigate = useNavigate()
  // const { kycstatus } = useAuthState()
  const pendingToastId = useRef<string | number | null>(null);
  const confirmingToastId = useRef<string | number | null>(null);
  const { registerLand, onChainLandId, isPending, isConfirming, isSuccess, error, waitError } = useLandRegistry()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cOfONo: '',
      landAddress: '',
      dateOfIssuance: new Date() || undefined,
      state: '',
      lga: '',
      area: 0,
      landuse: 'residential',
      picture: null
    }
  });

  const [lgaOptions, setLgaOptions] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [date, setDate] = useState<Date>();
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      form.setValue('dateOfIssuance', selectedDate); 
    }
  };

  // Format C of O number as user types
  const formatCofNumber = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^0-9A-Z]/g, '');
    
    // Apply formatting: xx|xx|xxxxyy
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}|${cleaned.slice(2)}`;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 2)}|${cleaned.slice(2, 4)}|${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 2)}|${cleaned.slice(2, 4)}|${cleaned.slice(4, 8)}${cleaned.slice(8, 10)}`;
    }
  };

  useEffect(() => {
    const selectedState = states.find((s) => s.value === form.watch('state'));
    setLgaOptions(selectedState?.lgas || []);
    form.setValue('lga', ''); // reset LGA when state changes
  }, [form.watch('state')]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
  if (!isConnected || !address) {
    toast.error("Please connect your wallet first!")
    return 
  }
  console.log(address)
    console.log(values);
    setFormValues(values);
    toast(`Land Registered: ${values.area} sqm in ${values.lga}, ${values.state} with C of O: ${values.cOfONo}`);
    const { cOfONo, landAddress, dateOfIssuance, state, lga, area, landuse, picture } = values
    try {
      const ipfs = await upload(picture)
    if(ipfs){
      const onChainData: RegisterLandOnChain = {
        cOfONo,
        state,
        lga,
        area,
        landuse,
        ipfs
      }
      await registerLand(onChainData)
    }
    } catch (error) {
      toast.error("Failed to register land")
    }
  }

  useEffect(() => {
    if (isPending) {
      if (pendingToastId.current) {
        toast.dismiss(pendingToastId.current);
      }
      if (confirmingToastId.current) {
        toast.dismiss(confirmingToastId.current);
      }
      
      pendingToastId.current = toast.loading("Sending transaction...");
    } else {
      if (pendingToastId.current) {
        toast.dismiss(pendingToastId.current);
        pendingToastId.current = null;
      }
    }
  }, [isPending])

  useEffect(() => {
    if (isConfirming) {
      // Dismiss pending toast if it exists
      if (pendingToastId.current) {
        toast.dismiss(pendingToastId.current);
        pendingToastId.current = null;
      }
      
      confirmingToastId.current = toast.loading("Confirming on blockchain...");
    } else {
      // Dismiss confirming toast when no longer confirming
      if (confirmingToastId.current) {
        toast.dismiss(confirmingToastId.current);
        confirmingToastId.current = null;
      }
    }
  }, [isConfirming])

   
  // Handle success state
  useEffect(() => {
    if (isSuccess) {
      if (pendingToastId.current) {
        toast.dismiss(pendingToastId.current);
        pendingToastId.current = null;
      }
      if (confirmingToastId.current) {
        toast.dismiss(confirmingToastId.current);
        confirmingToastId.current = null;
      }
      
      // Debug logging
      console.log('Transaction successful!');
      console.log('onChainLandId:', onChainLandId);
      
      const handleRegisterOffChain = async () => {
        if (onChainLandId) {
          toast.success(`🎉 Land registered with ID: ${onChainLandId}`);
          if (formValues) {
            const {cOfONo, landAddress, dateOfIssuance, state, lga, area, landuse, picture} = formValues;
            if(address){
              const data: RegisterLand = {
                currentOwner: address,
                landAddress,
                dateOfIssuance,
                state,
                lga,
                area,
                landUse: landuse,
                landIdOnChain: Number(onChainLandId)
              }
              console.log(data)
              await registerLandOffChain(data)
            }
          }
        } else {
          toast.success(`🎉 Land registered successfully!`);
          console.warn('onChainLandId is not available:', onChainLandId);
        }
        // Reset form on success
        form.reset();
        navigate({to:"/land"})
      };

      handleRegisterOffChain();
    }
  }, [isSuccess, onChainLandId])


  
  useEffect(() => {
    if (error) {
      // Dismiss any loading toasts
      if (pendingToastId.current) {
        toast.dismiss(pendingToastId.current);
        pendingToastId.current = null;
      }
      if (confirmingToastId.current) {
        toast.dismiss(confirmingToastId.current);
        confirmingToastId.current = null;
      }
      
      toast.error("Transaction failed");
      console.error(error);
      navigate({to:'/land'})
    }
  }, [error])

  useEffect(() => {
    if (waitError) {
      // Dismiss any loading toasts
      if (pendingToastId.current) {
        toast.dismiss(pendingToastId.current);
        pendingToastId.current = null;
      }
      if (confirmingToastId.current) {
        toast.dismiss(confirmingToastId.current);
        confirmingToastId.current = null;
      }
      
      console.error("Wait error:", waitError);
      toast.error("Transaction failed to send");
    }
  }, [waitError])

  return (
    <div className="flex items-center justify-center w-full h-full bg-[#338e64] py-15">
      <div className="bg-white w-[50rem] border rounded-lg shadow-lg py-8 px-10 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-[#338e64]">Register Land</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Certificate of Occupancy Number */}
            <FormField
              control={form.control}
              name="cOfONo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate of Occupancy Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12|34|5678AB"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCofNumber(e.target.value.toUpperCase());
                        field.onChange(formatted);
                      }}
                      maxLength={12}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Address */}
            <FormField
              control={form.control}
              name="landAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full property address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Issuance */}
            <FormField
              control={form.control}
              name="dateOfIssuance"
              render={() => (
                <FormItem>
                  <FormLabel>Date of C of O Issuance</FormLabel>
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

            {/* State */}
            <div className='flex justify-between'>
            <FormField 
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className='w-[20rem]'>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LGA */}
            <FormField
              control={form.control}
              name="lga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Government Area</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-[20rem]'>
                        <SelectValue placeholder="Select an LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        {lgaOptions.map((lga) => (
                          <SelectItem key={lga} value={lga}>
                            {lga}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
</div>
            {/* Area */}
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (sq meters)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter area size" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Land Use */}
            <FormField
              control={form.control}
              name="landuse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Use</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Select land use type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Picture Upload */}
            <FormField
              control={form.control}
              name="picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate of Occupancy</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#338e64] text-white hover:bg-[#27694b]"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? 'Processing...' : 'Register Land'}
            </Button>
          </form>
        </Form>
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Info className="w-6 h-6 text-blue-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Document Visibility Notice
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Your Certificate of Occupancy will be publicly accessible
                  </span>
                </div>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Once uploaded, your C of O document will be visible to anyone who searches for property information in our public registry. This promotes transparency in land ownership and helps prevent fraudulent claims.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}