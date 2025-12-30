"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JobMatchingEngine, JobMatchScore } from "@/lib/jobMatchingEngine";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Star, 
  TrendingUp, 
  Eye,
  Heart,
  ExternalLink,
  Filter,
  SortAsc,
  Loader2
} from "lucide-react";

interface MatchedJobsProps {
  userPreferences: any;
  onJobSelect?: (job: any) => void;
}

export function MatchedJobs({ userPreferences, onJobSelect }: MatchedJobsProps) {
  const [matchedJobs, setMatchedJobs] = useState<JobMatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'salary' | 'date'>('score');
  const [minScore, setMinScore] = useState(60);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);

  const matchingEngine = new JobMatchingEngine();

  useEffect(() => {
    if (userPreferences) {
      fetchAndMatchJobs();
    }
  }, [userPreferences]);

  const fetchAndMatchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/jobs', {
        params: { page: 1, limit: 50 }
      });

      let jobs = [];
      if (Array.isArray(response.data)) {
        jobs = response.data;
      } else if (response.data.jobs && Array.isArray(response.data.jobs)) {
        jobs = response.data.jobs;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        jobs = response.data.data;
      }

      // Use the AI matching engine
      const matchedResults = matchingEngine.matchJobs(userPreferences, jobs);
      setMatchedJobs(matchedResults);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedJobs = matchedJobs
    .filter(match => match.overallScore >= minScore)
    .sort((a, b) => {
      switch (sortBy) {
        case 'salary':
          const aSalary = a.job.salaryMax || a.job.salaryMin || 0;
          const bSalary = b.job.salaryMax || b.job.salaryMin || 0;
          return bSalary - aSalary;
        case 'date':
          return new Date(b.job.createdAt || 0).getTime() - new Date(a.job.createdAt || 0).getTime();
        case 'score':
        default:
          return b.overallScore - a.overallScore;
      }
    });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    return 'Fair Match';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-700 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing jobs and finding perfect matches...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Matched Jobs</h3>
            <p className="text-sm text-gray-600">
              Found {filteredAndSortedJobs.length} jobs matching your preferences
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Min Score Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <label className="text-sm text-gray-600">Min Score:</label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={50}>50%+</option>
                <option value={60}>60%+</option>
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
                <option value={90}>90%+</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'salary' | 'date')}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="score">Best Match</option>
                <option value="salary">Highest Salary</option>
                <option value="date">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredAndSortedJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No jobs found matching your criteria. Try lowering the minimum score.</p>
          </Card>
        ) : (
          filteredAndSortedJobs.map((match, index) => (
            <Card key={match.job._id || index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 hover:text-amber-700 cursor-pointer"
                          onClick={() => onJobSelect?.(match.job)}>
                        {match.job.title}
                      </h4>
                      
                      {/* Match Score Badge */}
                      <Badge className={`${getScoreColor(match.overallScore)} px-3 py-1 font-semibold flex items-center gap-1`}>
                        <Star className="h-3 w-3" />
                        {match.overallScore}% Match
                      </Badge>
                      
                      {/* Match Quality Label */}
                      <span className="text-xs text-gray-500">
                        {getScoreLabel(match.overallScore)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {typeof match.job.company === 'object' ? match.job.company?.name : match.job.company}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {match.job.location}
                        {(match.job.isRemote || match.job.remote) && 
                          <Badge variant="outline" className="ml-1 text-xs">Remote</Badge>
                        }
                      </div>

                      {(match.job.salaryMin || match.job.salaryMax) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-green-600">
                            {match.job.salaryMin && match.job.salaryMax 
                              ? `$${match.job.salaryMin.toLocaleString()} - $${match.job.salaryMax.toLocaleString()}`
                              : match.job.salaryMin 
                                ? `$${match.job.salaryMin.toLocaleString()}+`
                                : `Up to $${match.job.salaryMax?.toLocaleString()}`
                            }
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(match.job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Match Reasons */}
                    {match.matchReasons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Why this matches you:</p>
                        <div className="flex flex-wrap gap-1">
                          {match.matchReasons.map((reason, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {match.job.skills && match.job.skills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {match.job.skills.slice(0, 6).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {match.job.skills.length > 6 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              +{match.job.skills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Job Description Preview */}
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {match.job.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      onClick={() => onJobSelect?.(match.job)}
                      className="bg-amber-700 hover:bg-amber-800 text-white text-sm"
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowBreakdown(
                        showBreakdown === match.job._id ? null : match.job._id
                      )}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Analysis
                    </Button>
                  </div>
                </div>

                {/* Match Breakdown */}
                {showBreakdown === match.job._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Match Analysis</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(match.breakdown).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="capitalize text-gray-600">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <span className="font-semibold">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredAndSortedJobs.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={fetchAndMatchJobs}
            className="mt-4"
          >
            Refresh Matches
          </Button>
        </div>
      )}
    </div>
  );
}