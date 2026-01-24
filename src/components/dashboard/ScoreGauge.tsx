import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-5xl', label: 'text-base' },
  };

  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = size === 'sm' ? 34 : size === 'md' ? 56 : 86;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(142, 76%, 36%)';
    if (score >= 60) return 'hsl(175, 60%, 40%)';
    if (score >= 40) return 'hsl(38, 92%, 50%)';
    return 'hsl(0, 72%, 51%)';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeClasses[size].container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="hsl(210, 20%, 92%)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={cn('font-bold text-foreground', sizeClasses[size].text)}
          >
            {score}
          </motion.span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground">out of 100</span>
          )}
        </div>
      </div>
      {showLabel && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={cn('font-medium', sizeClasses[size].label)}
          style={{ color: getScoreColor(score) }}
        >
          {getScoreLabel(score)}
        </motion.p>
      )}
    </div>
  );
}
