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
import { useEffect, useState } from 'react';
import { usePinataUpload } from '@/hooks/usePinataUpload';
import type { RegisterLandOnChain } from '@/service/interface/land.interface';
import { useLandRegistry } from '@/hooks/useLandRegistryContract';
import { useAccount } from 'wagmi';

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
  const { registerLand, onChainLandId, isPending, isConfirming, isSuccess, error } = useLandRegistry()
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
      toast.loading("Sending transaction...")
    }
  }, [isPending])

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Confirming on blockchain...")
    }
  }, [isConfirming])

  useEffect(() => {
    if (isSuccess && onChainLandId) {
      toast.success(`🎉 Land registered with ID: ${onChainLandId}`)
      // Do something with the landId here!
    }
  }, [isSuccess, onChainLandId])

  useEffect(() => {
    if (error) {
      toast.error("Transaction failed")
      console.error(error)
    }
  }, [error])

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

            <Button type="submit" className="w-full bg-[#338e64] text-white hover:bg-[#27694b]">
              Register Land
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
