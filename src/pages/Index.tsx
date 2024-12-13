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

const Index = () => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [userRole, setUserRole] = React.useState<'user' | 'creator' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user role when session changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data.role);
    };

    fetchUserRole();
  }, [session]);

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
    enabled: !!session, // Only fetch if user is authenticated
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
          <h3 className="text-lg font-semibold mb-2">No hay agentes</h3>
          <p className="text-muted-foreground mb-4">
            {userRole === 'creator' 
              ? 'Crea tu primer agente IA para comenzar'
              : 'No hay agentes disponibles en este momento'}
          </p>
          {userRole === 'creator' && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Agente
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Agentes IA</h1>
            <p className="text-muted-foreground">
              {userRole === 'creator' 
                ? 'Crea y gestiona tus asistentes IA'
                : 'Chatea con asistentes IA'}
            </p>
          </div>
          {userRole === 'creator' && !showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Agente
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