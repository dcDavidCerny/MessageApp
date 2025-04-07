import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../Query/QueryHooks";
import { Loading } from "../Components/Loading";
import { InputDefault } from "@/Components/ShadcnComponents/InputDefault";
import { ButtonSecondary } from "@/Components/ShadcnComponents/ButtonSecondary";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { Link } from "react-router-dom";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(3, "Password must be at least 6 characters"),
});

export const LoginComponent = () => {
  const navigate = useNavigate();
  const { mutate: loginUser, isPending: loginPending } = useLogin();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    loginUser(data, {
      onError: (error) => {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
      },
      onSuccess: () => {
        alert("Login successful!");
        navigate("/chat");
      },
    });
  };

  return (
    <LoginWrapper>
      {loginPending && <Loading animation="pulse" />}
      <h2>Login</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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

          <ButtonSecondary>Login</ButtonSecondary>
        </form>
      </Form>

      <div className="hrefToRegisterDiv">
        <p>Are you new here? Register down here:</p>
        <Link to="/register">
          <ButtonSecondary className="hrefToRegister">
            REGISTER HERE
          </ButtonSecondary>
        </Link>
      </div>
    </LoginWrapper>
  );
};

const LoginWrapper = styled.div`
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

  .hrefToRegisterDiv {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
      font-size: 18px;
    }

    .hrefToRegister {
      padding: 10px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
    }
  }
`;
