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

const formSchema = z.object({
  state: z.string(),
  lga: z.string(),
  area: z.coerce.number().min(1),
  landuse: z.enum(['residential', 'industrial']),
  picture: z.any()
});

export function Register() {
  const { upload, uploadStatus } = usePinataUpload()
  const { address, isConnected } = useAccount() 
   const pendingToastId = useRef<string | number | null>(null);
  const confirmingToastId = useRef<string | number | null>(null);
  const { registerLand, onChainLandId, isPending, isConfirming, isSuccess, error, waitError } = useLandRegistry()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: '',
      lga: '',
      area: 0,
      landuse: 'residential',
      picture: null
    }
  });

  const [lgaOptions, setLgaOptions] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);


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
    toast(`Land Registered: ${values.area} sqm in ${values.lga}, ${values.state}`);
    const { state, lga, area, landuse, picture } = values
    try {
      const ipfs = await upload(picture)
    if(ipfs){
      const onChainData: RegisterLandOnChain = {
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
            const {state, lga, area, landuse, picture} = formValues;
            if(address){
              const data: RegisterLand = {
                currentOwner: address,
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
    <div className="flex items-center justify-center w-full h-screen bg-[#338e64]">
      <div className="bg-white w-[50rem] border rounded-lg shadow-lg py-8 px-10 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-[#338e64]">Register Land</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
      </div>
    </div>
  );
}
