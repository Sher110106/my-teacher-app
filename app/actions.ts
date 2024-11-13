"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();
  const schoolName = formData.get("schoolName")?.toString();
  const location = formData.get("location")?.toString();
  const curriculumType = formData.get("curriculumType")?.toString();
  const fullName = formData.get("fullName")?.toString();
  const subjects = formData.getAll("subjects");
  const qualifications = formData.get("qualifications")?.toString();
  const experienceYears = formData.get("experienceYears")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !role || (!schoolName && !fullName)) {
    return encodedRedirect("error", "/sign-up", "All fields are required");
  }

  // Validate role
  if (role !== 'teacher' && role !== 'school') {
    
    return encodedRedirect("error", "/sign-up", "Invalid role selected");
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName || schoolName,
        role: role
      }
    }
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (!user) {
    return encodedRedirect("error", "/sign-up","Not Valid Information");
  }

  // Create profile based on role
  const profile = {
    id: user.id,
    full_name: fullName || schoolName,
    role: role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .insert([profile]);

  if (profileError) {
    await supabase.auth.admin.deleteUser(user.id);
    return encodedRedirect("error", "/sign-up", profileError.message);
  }

  // Create role-specific profile
  if (role === 'teacher') {
    const teacherProfile = {
      id: user.id,
      full_name: fullName,
      subjects: subjects,
      qualifications: qualifications,
      experience_years: parseInt(experienceYears || '0')
    };
    const { error: teacherError } = await supabase
      .from('teacher_profiles')
      .insert([teacherProfile]);
    if (teacherError) {
      await supabase.auth.admin.deleteUser(user.id);
      return encodedRedirect("error", "/sign-up", teacherError.message);
    }
  } else if (role === 'school') {
    const schoolProfile = {
      id: user.id,
      school_name: schoolName,
      location: location,
      curriculum_type: curriculumType
    };
    const { error: schoolError } = await supabase
      .from('school_profiles')
      .insert([schoolProfile]);
    if (schoolError) {
      await supabase.auth.admin.deleteUser(user.id);
      return encodedRedirect("error", "/sign-in", schoolError.message);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-in",
    "Thanks for signing up! Please check your email for a verification link."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
