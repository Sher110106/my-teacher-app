'use client'
import { useState, useEffect } from "react";
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default function Signup(props: { searchParams: Promise<Message>; }) {
  const [searchParams, setSearchParams] = useState<Message | null>(null);
  const [selectedRole, setSelectedRole] = useState<'school' | 'teacher' | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string>();

  useEffect(() => {
    async function fetchSearchParams() {
      const params = await props.searchParams;
      setSearchParams(params);
    }
    fetchSearchParams();
  }, [props.searchParams]);

  if (searchParams && "message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  const handleRoleChange = (value: 'school' | 'teacher') => {
    setSelectedRole(value);
  };

  const handleSubjectChange = (value:string) => {
    setSelectedSubjects(value);
    
  };

  return (
    <>
      <form
        className="flex flex-col min-w-64 max-w-64 mx-auto"
        method="POST"
        action="/api/sign-up"
      >
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <Label htmlFor="role">Role</Label>
          <div className="flex gap-2">
            <Label htmlFor="schoolCheckbox" className="flex items-center gap-2">
              <Input
                type="checkbox"
                id="schoolCheckbox"
                name="role"
                value="school"
                checked={selectedRole === 'school'}
                onChange={() => handleRoleChange('school')}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              School
            </Label>
            <Label htmlFor="teacherCheckbox" className="flex items-center gap-2">
              <Input
                type="checkbox"
                id="teacherCheckbox"
                name="role"
                value="teacher"
                checked={selectedRole === 'teacher'}
                onChange={() => handleRoleChange('teacher')}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              Teacher
            </Label>
          </div>

          {selectedRole === 'school' && (
            <>
              <Label htmlFor="schoolName">School Name</Label>
              <Input name="schoolName" placeholder="Your School Name" required />
              <Label htmlFor="location">Location</Label>
              <Input name="location" placeholder="School Location" required />
              <Label htmlFor="curriculumType">Curriculum Type</Label>
              <Input name="curriculumType" placeholder="Curriculum Type" required />
            </>
          )}

          {selectedRole === 'teacher' && (
            <>
              <Label htmlFor="fullName">Full Name</Label>
              <Input name="fullName" placeholder="Your Full Name" required />
              <Label htmlFor="subjects">Subjects</Label>
              <div className="flex flex-col gap-2">
                <Label htmlFor="math" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="math"
                    name="subjects"
                    value="math"
                    checked={selectedSubjects==='Math'}
                    onChange={()=>handleSubjectChange("Math")}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Math
                </Label>
                <Label htmlFor="science" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="science"
                    name="subjects"
                    value="science"
                    checked={selectedSubjects==='Science'}
                    onChange={()=>handleSubjectChange("Science")}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Science
                </Label>
                <Label htmlFor="english" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="english"
                    name="subjects"
                    value="english"
                    checked={selectedSubjects==='English'}
                    onChange={()=>handleSubjectChange("English")}
                    className="h -4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  English
                </Label>
                <Label htmlFor="history" className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="history"
                    name="subjects"
                    value="history"
                    checked={selectedSubjects==='History'}
                    onChange={()=>handleSubjectChange("History")}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  History
                </Label>
              </div>
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input name="qualifications" placeholder="Qualifications" required />
              <Label htmlFor="experienceYears">Experience Years</Label>
              <Input name="experienceYears" placeholder="Experience Years" type="number" required />
            </>
          )}

          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          {searchParams && <FormMessage message={searchParams} />}
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}