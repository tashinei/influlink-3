import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  campaign: any;
}

export const CampaignCard = ({ campaign }: Props) => {
  return (
    <Card className="hover:shadow-lg transition">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={campaign.companyLogo || "/placeholder-logo.png"}
            className="h-10 w-10 rounded object-cover"
          />
          <div>
            <h3 className="font-semibold">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground">{campaign.type}</p>
          </div>
        </div>

        <p className="text-sm line-clamp-2">{campaign.description}</p>

        <div className="flex justify-between items-center">
          <Badge variant="outline">{campaign.status}</Badge>
          <span className="font-medium">${campaign.budget.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
