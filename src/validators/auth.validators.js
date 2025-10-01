import * as z from "zod";

// console.log(typeof z);

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .lowercase("Username must be lowercase")
    .max(20, "Username cannot exceed 20 characters"),

  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long"),

  email: z.email("Please enter a valid mail "),
});

/* code snippet to test schemas ...
const result = registerSchema.safeParse({
  username: "devesH",
  password: "123456",
  email: "dev@gmail.com",
});
console.log(result);
console.log("hi");
console.log(result.error instanceof z.ZodError);
console.log(result.error.issues)
console.log(typeof registerSchema);
*/

const loginSchema = z.object({
  email: z.email("Please enter a valid mail"),

  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long"),
});

export { registerSchema, loginSchema };
