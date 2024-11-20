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
  const headersList = await headers();
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = headersList.get("host");
  const baseUrl = `${protocol}://${host}`;

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
      emailRedirectTo: `${baseUrl}/auth/callback`,
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return encodedRedirect("error", "/sign-in", "User not found");
  }
  
  const metadata = user.user_metadata;
  const role = metadata.role;

if (role === 'teacher') {
  return redirect("/protected/teacher/dashboard");
} else if (role === 'school') {
  return redirect("/protected/school/dashboard");
} else {
  return encodedRedirect("error", "/sign-in", "User not found");
}


};


export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || headersList.get("host");

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/confirm?next=/reset-password`,
  });

  if (error) {
    console.error("Password reset error:", error.message);
    return encodedRedirect("error", "/forgot-password", error.message);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
