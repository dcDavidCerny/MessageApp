import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../Query/QueryHooks";
import { Loading } from "../Components/Loading";
import { ButtonSecondary } from "@/Components/ShadcnComponents/ButtonSecondary";
import { InputDefault } from "@/Components/ShadcnComponents/InputDefault";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";

const formSchema = z
  .object({
    username: z.string().min(2, "Username must be at least 2 characters"),
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(3, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const RegisterComponent = () => {
  const navigate = useNavigate();
  const { mutate: registerUser, isPending: registerPending } = useRegister();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    registerUser(data, {
      onError: (error) => {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
      },
      onSuccess: () => {
        alert("Registration successful!");
        navigate("/chat");
      },
    });
  };

  return (
    <RegisterWrapper>
      {registerPending && <Loading animation="pulse" />}
      <h2>Register</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <InputDefault placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <InputDefault placeholder="Display Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputDefault type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <InputDefault
                    type="password"
                    placeholder="Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <InputDefault
                    type="password"
                    placeholder="Confirm Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ButtonSecondary>Register</ButtonSecondary>
        </form>
      </Form>

      <div className="hrefToLoginDiv">
        <p>You already got an account? Register down here:</p>
        <Link to="/login">
          <ButtonSecondary className="hrefToLogin">LOGIN HERE</ButtonSecondary>
        </Link>
      </div>
    </RegisterWrapper>
  );
};

const RegisterWrapper = styled.div`
  width: 50vw;
  margin: auto;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h2 {
    margin-top: 100px;
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--primary);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 30%;
  }

  .hrefToLoginDiv {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
      font-size: 18px;
    }

    .hrefToLogin {
      padding: 10px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
    }
  }
`;
