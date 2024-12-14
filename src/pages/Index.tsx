import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import CreateAgentForm from "@/components/CreateAgentForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import AuthUI from "@/components/auth/AuthUI";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [userRole, setUserRole] = React.useState<'user' | 'creator' | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

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

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const renderAgentCards = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      ));
    }

    if (!agents?.length) {
      return (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-semibold mb-2">{t("agents.noAgents")}</h3>
          <p className="text-muted-foreground mb-4">
            {userRole === 'creator' 
              ? t("agents.noAgents.creator")
              : t("agents.noAgents.user")}
          </p>
          {userRole === 'creator' && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("agents.newAgent")}
            </Button>
          )}
        </div>
      );
    }

    return agents.map((agent) => (
      <AgentCard
        key={agent.id}
        id={agent.id}
        name={agent.name}
        description={agent.description}
        traits={agent.traits || []}
        onSelect={() => console.log("Selected agent:", agent.name)}
      />
    ));
  };

  if (!session) {
    return <AuthUI />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t("agents.title")}</h1>
            <p className="text-muted-foreground">
              {userRole === 'creator' 
                ? t("agents.subtitle.creator")
                : t("agents.subtitle.user")}
            </p>
          </div>
          {userRole === 'creator' && !showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("agents.newAgent")}
            </Button>
          )}
        </div>

        {showCreateForm ? (
          <div className="mb-8">
            <CreateAgentForm />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderAgentCards()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
