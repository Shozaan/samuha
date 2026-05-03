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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { authApi } from '../apis/authApi'

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: 'sujshrestha77@gmail.com',
            password: 'password123'
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await authApi.login(values);
            const user = response.user;

            login(user);

            toast.success("Logged in successfully", {
                description: `Welcome back, ${user.name}!`
            });

            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Login failed. Please check your credentials.");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormInput
                                name="email"
                                label="Email"
                                placeholder="admin@samuha.com"
                            />
                            <FormInput
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="••••••"
                            />
                            <Button type="submit" className="w-full">Sign In</Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center">
                        <Link to="/register" className="text-sm text-primary hover:underline">
                            Don't have an account? Register
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
