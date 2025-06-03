import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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
        <div>
            <div>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}