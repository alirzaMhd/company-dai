import { useParams } from 'react-router-dom';

function IssueDetail() {
  const { id } = useParams();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Issue {id}</h2>
        <p className="text-muted-foreground">Issue details</p>
      </div>
    </div>
  );
}

export default IssueDetail;