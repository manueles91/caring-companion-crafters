import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreateAgentForm from "@/components/CreateAgentForm";
import AuthUI from "@/components/auth/AuthUI";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import AgentHeader from "@/components/agents/AgentHeader";
import AgentList from "@/components/agents/AgentList";
import FeaturesCarousel from "@/components/features/FeaturesCarousel";
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [session, setSession] = React.useState(null);
  const [userRole, setUserRole] = React.useState<'user' | 'creator' | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const showCreateForm = searchParams.get('create') === 'true';
  const editAgentId = searchParams.get('edit');

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
        <AgentHeader 
          userRole={userRole}
          showCreateForm={showCreateForm}
          onCreateAgent={() => {}}
          session={session}
        />

        {(showCreateForm || editAgentId) ? (
          <div className="mb-8">
            <CreateAgentForm agentId={editAgentId} />
          </div>
        ) : (
          <AgentList 
            userRole={userRole}
            onCreateAgent={() => {}}
          />
        )}

        {!session && (
          <>
            <FeaturesCarousel />
            <div id="auth-section" className="mt-8 p-6 bg-muted dark:bg-[#1A1F2C] rounded-lg scroll-mt-24 max-w-lg mx-auto text-center">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">{t("auth.wantMore")}</h2>
              <p className="mb-4 dark:text-gray-300">{t("auth.signUpTo")}:</p>
              <ul className="list-disc list-inside mb-6 space-y-2 dark:text-gray-300">
                <li>{t("auth.features.createAgents")}</li>
                <li>{t("auth.features.addFiles")}</li>
                <li>{t("auth.features.enableMemory")}</li>
              </ul>
              <AuthUI />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;