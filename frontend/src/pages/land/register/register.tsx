'use client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { states } from "@/lib/states"

const formSchema = z.object({
    state: z.string(),
    lga: z.string(),
    area: z.number(),
    landuse: z.string(),
    picture: z.any()
})

export function Register(){
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            state: "",
            lga: "",
            area: 0,
            landuse: "residential",
            picture: null
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>){
        console.log(values)
        toast(`Land Registered: ${values.area}`)
    }

    return(
        <div className="flex items-center justify-center w-full h-[100vh] bg-[#338e64]">
            <div className="bg-white w-[50rem] h-[50rem] border rounded-lg shadow-lg py-5 px-8">
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
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
 <FormField
                control={form.control}
                name="landuse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land Use</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Land Use" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="industrial">
                            Industrial
                          </SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="accessories">
                            Accessories
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="area"
                render={()}
              /> */}

                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}