import { Link } from 'react-router-dom'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Form,
    FormInput,
    toast
} from '@sujan77/ui-components'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function Register() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast.success("Registration successful", {
            description: `Welcome, ${values.name}!`
        })
    }

    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Get started with Samuha Dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormInput
                                name="name"
                                label="Full Name"
                                placeholder="John Doe"
                            />
                            <FormInput
                                name="email"
                                label="Email"
                                placeholder="john@example.com"
                            />
                            <FormInput
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="••••••"
                            />
                            <FormInput
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••"
                            />
                            <Button type="submit" className="w-full">Register</Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-sm text-primary hover:underline">
                            Already have an account? Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
