import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreateAgentForm from "@/components/CreateAgentForm";
import AuthUI from "@/components/auth/AuthUI";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import AgentHeader from "@/components/agents/AgentHeader";
import AgentList from "@/components/agents/AgentList";

const Index = () => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [userRole, setUserRole] = React.useState<'user' | 'creator' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
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

  if (!session) {
    return <AuthUI />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
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
      </div>
    </div>
  );
};

export default Index;