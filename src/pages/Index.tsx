import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreateAgentForm from "@/components/CreateAgentForm";
import AuthUI from "@/components/auth/AuthUI";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import AgentHeader from "@/components/agents/AgentHeader";
import AgentList from "@/components/agents/AgentList";
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [userRole, setUserRole] = React.useState<'user' | 'creator' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize guest ID if not exists
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', uuidv4());
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkAndCreateProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        checkAndCreateProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profile && (!error || error.code === 'PGRST116')) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            username: session?.user?.email,
            role: 'user'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast({
            title: "Error",
            description: "Could not create user profile",
            variant: "destructive",
          });
        } else if (newProfile) {
          setUserRole(newProfile.role as 'user' | 'creator');
          toast({
            title: "Success",
            description: "Profile created successfully",
          });
        }
      } else if (profile) {
        setUserRole(profile.role as 'user' | 'creator');
      }
    } catch (error) {
      console.error('Error handling profile:', error);
      toast({
        title: "Error",
        description: "An error occurred while setting up your profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation session={session} />
      <div className="container mx-auto px-4 py-8 pt-24">
        {session ? (
          <>
            <AgentHeader 
              userRole={userRole}
              showCreateForm={showCreateForm}
              onCreateAgent={() => setShowCreateForm(true)}
            />

            {showCreateForm ? (
              <div className="mb-8">
                <CreateAgentForm />
              </div>
            ) : (
              <AgentList 
                userRole={userRole}
                onCreateAgent={() => setShowCreateForm(true)}
              />
            )}
          </>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-6">Welcome! Try chatting with our agents</h1>
            <p className="text-muted-foreground mb-8">
              You can chat with our agents as a guest. After 5 messages, you'll need to sign up to continue.
            </p>
            <AgentList 
              userRole={null}
              onCreateAgent={() => {
                toast({
                  title: "Sign up required",
                  description: "Please sign up to create new agents",
                });
              }}
            />
            <div className="mt-8 p-6 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Want to do more?</h2>
              <p className="mb-4">Sign up to:</p>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>Continue conversations after 5 messages</li>
                <li>Create your own agents</li>
                <li>Save your chat history</li>
              </ul>
              <AuthUI />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;