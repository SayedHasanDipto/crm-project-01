"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { signIn } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn.email({ email, password });
      if (error) {
        toast.error(error.message ?? "Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-bold text-base-100 text-lg">
            P
          </div>
          <span className="text-xl font-semibold tracking-tight">Pipeline</span>
        </div>

        <Card className="bg-base-200 border border-white/[0.07] shadow-none">
          <CardBody className="p-7">
            <h1 className="text-lg font-semibold mb-1">Sign in</h1>
            <p className="text-sm text-base-content/50 font-mono mb-6">Welcome back to your CRM</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                label="Email"
                value={email}
                onValueChange={setEmail}
                required
                variant="bordered"
                classNames={{
                  input: "font-mono text-sm",
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-primary"
                }}
              />
              <Input
                type="password"
                label="Password"
                value={password}
                onValueChange={setPassword}
                required
                variant="bordered"
                classNames={{
                  input: "font-mono text-sm",
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-primary"
                }}
              />
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="font-semibold mt-1"
                fullWidth
              >
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm text-base-content/40 mt-5 font-mono">
              No account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
