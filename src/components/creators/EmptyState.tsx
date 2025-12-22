import { Button } from '@/components/ui/button';
import { SearchX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export const EmptyState = ({ onClearFilters }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center mb-6 animate-pulse-glow">
        <SearchX className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No creators found</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        We couldn't find any creators matching your criteria. Try adjusting your filters or search terms.
      </p>
      <Button onClick={onClearFilters} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Clear all filters
      </Button>
    </div>
  );
};
