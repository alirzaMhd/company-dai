import { useParams } from 'react-router-dom';

function AgentDetail() {
  const { id } = useParams();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Agent {id}</h2>
        <p className="text-muted-foreground">Agent configuration</p>
      </div>
    </div>
  );
}

export default AgentDetail;