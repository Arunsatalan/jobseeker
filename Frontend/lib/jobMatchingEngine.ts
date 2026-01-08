// Modern Job Matching Algorithm - 2026 Strategy (Enhanced)
export interface JobMatchScore {
  job: any;
  overallScore: number;
  breakdown: {
    roleMatch: number;
    locationMatch: number;
    salaryMatch: number;
    experienceMatch: number;
    workTypeMatch: number;
    skillsMatch: number;
    industryMatch: number;
    companySizeMatch: number;
    benefitsMatch: number;
    growthMatch: number;
    techStackMatch: number;
    descriptionMatch: number;
  };
  matchReasons: string[];
}

export class JobMatchingEngine {
  // Enhanced Weights (totals 100%)
  private weights = {
    role: 0.25,        // 25% (Critical)
    description: 0.15, // 15% (Content analysis)
    techStack: 0.15,   // 15% (Hard skills)
    location: 0.10,    // 10%
    salary: 0.10,      // 10%
    experience: 0.10,  // 10%
    workType: 0.05,    // 5%
    industry: 0.05,    // 5%
    companySize: 0.025,// 2.5%
    benefits: 0.025,   // 2.5%
  };

  /**
   * Advanced String Similarity using Levenshtein + Fuzzy Logic
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;
    if (s1.includes(s2) || s2.includes(s1)) return 90;

    // Levenshtein distance
    const levenshtein = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = ((maxLength - levenshtein) / maxLength) * 100;

    return Math.min(100, similarity);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1,     // deletion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private extractKeywords(text: string): string[] {
    if (!text) return [];
    // Enhanced stop words list
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'so', 'if', 'to', 'with', 'for', 'of', 'in', 'on', 'at', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'not', 'no', 'as', 'from', 'we', 'you', 'they', 'it', 'job', 'role', 'work', 'experience', 'requirement', 'requirements', 'skill', 'skills', 'responsibilities', 'responsibility', 'team', 'company', 'candidate'];

    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Keep hyphens for terms like 'full-stack'
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));
  }

  /**
   * Role/Title Matching with Vector-like Semantic Check
   */
  private calculateRoleMatch(userRoles: string[], jobTitle: string, jobCategory: string): number {
    if (!userRoles.length) return 50;

    const jobText = `${jobTitle} ${jobCategory || ''}`.toLowerCase();

    let bestScore = 0;

    for (const role of userRoles) {
      const roleLower = role.toLowerCase();

      // 1. Precise Match
      if (jobText.includes(roleLower)) return 100;

      // 2. Keyword Intersection (Jaccard Index-ish)
      const roleKeywords = this.extractKeywords(roleLower);
      const jobKeywords = this.extractKeywords(jobText);

      if (roleKeywords.length === 0) continue;

      const intersection = roleKeywords.filter(k => jobKeywords.some(jk => jk.includes(k) || k.includes(jk)));
      const intersectionScore = (intersection.length / roleKeywords.length) * 100;

      bestScore = Math.max(bestScore, intersectionScore);
    }

    return Math.min(100, bestScore);
  }

  /**
   * Smart Tech Stack Analysis
   */
  private calculateTechStackMatch(userRoles: string[], jobDescription: string, jobSkills: string[]): number {
    const commonTech = [
      'javascript', 'typescript', 'python', 'java', 'c#', '.net', 'react', 'angular', 'vue', 'node', 'express',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
      'redis', 'graphql', 'rest', 'api', 'ci/cd', 'git', 'agile', 'scrum', 'backend', 'frontend', 'fullstack'
    ];

    const descriptionLower = jobDescription.toLowerCase();
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

    // Infer user tech stack from desired roles (heuristic)
    // Ideally user inputs skills directly, but using roles as proxy if missing
    let userPotentialStack: string[] = [];
    userRoles.forEach(role => {
      const r = role.toLowerCase();
      if (r.includes('frontend') || r.includes('react') || r.includes('angular')) userPotentialStack.push('javascript', 'react', 'frontend');
      if (r.includes('backend') || r.includes('node') || r.includes('java')) userPotentialStack.push('node', 'java', 'python', 'sql', 'backend');
      if (r.includes('fullstack')) userPotentialStack.push('javascript', 'react', 'node', 'fullstack');
      if (r.includes('data')) userPotentialStack.push('python', 'sql', 'data');
    });

    userPotentialStack = [...new Set(userPotentialStack)]; // unique

    if (userPotentialStack.length === 0) return 60; // Neutral if no tech inferred

    let matchCount = 0;
    userPotentialStack.forEach(tech => {
      if (descriptionLower.includes(tech) || jobSkillsLower.includes(tech)) {
        matchCount++;
      }
    });

    return Math.min(100, (matchCount / userPotentialStack.length) * 100);
  }

  /**
   * Description Semantic Content Match
   */
  private calculateDescriptionMatch(userRoles: string[], jobDescription: string): number {
    if (!jobDescription || !userRoles.length) return 50;

    const descLower = jobDescription.toLowerCase();
    let score = 0;

    // Check for "seniority" alignment in description
    const entryLevel = ['junior', 'entry', 'associate', 'fresh', 'grad'];
    const midLevel = ['mid', 'intermediate'];
    const seniorLevel = ['senior', 'lead', 'principal', 'staff', 'manager', 'architect'];

    // Boost if description keywords align with role context (e.g. "team", "growth", "build")
    const positiveKeywords = ['team', 'grow', 'build', 'develop', 'create', 'innovate', 'stable', 'funded'];
    const negativeKeywords = ['stress', 'urgent', 'overtime', 'weekend', 'pressure']; // Optional advanced sentiment

    let positiveHits = 0;
    positiveKeywords.forEach(k => { if (descLower.includes(k)) positiveHits++; });

    // Basic "vibe check" score
    score += (positiveHits / positiveKeywords.length) * 30;

    // Role relevance in description
    if (userRoles.some(r => descLower.includes(r.toLowerCase()))) score += 70;
    else score += 40;

    return Math.min(100, score);
  }

  private calculateLocationMatch(userLocations: string[], jobLocation: string, isRemote: boolean): number {
    if (isRemote && userLocations.some(l => l.toLowerCase() === 'remote')) return 100;
    if (!userLocations.length) return 70;

    const jobLoc = jobLocation.toLowerCase();

    return userLocations.some(ul => {
      const u = ul.toLowerCase();
      return u === 'remote' ? isRemote : (jobLoc.includes(u) || u.includes(jobLoc));
    }) ? 100 : 0;
  }

  private calculateSalaryMatch(
    userMin: number, userMax: number, userPeriod: string,
    jobMin?: number, jobMax?: number, jobPeriod?: string
  ): number {
    if (!jobMin && !jobMax) return 60; // Unknown salary

    const uMinYearly = this.convertToYearly(userMin || 0, userPeriod);
    const uMaxYearly = this.convertToYearly(userMax || 0, userPeriod);
    const jMinYearly = this.convertToYearly(jobMin || 0, jobPeriod || 'yearly');
    const jMaxYearly = this.convertToYearly(jobMax || 0, jobPeriod || 'yearly');

    // Salary overlap check
    const startObj = Math.max(uMinYearly, jMinYearly);
    const endObj = Math.min(uMaxYearly, jMaxYearly || jMinYearly);

    if (startObj <= endObj) return 100; // Overlap exists

    // If no overlap, how far off?
    const diff = Math.abs(uMinYearly - (jMaxYearly || jMinYearly));
    const percentDiff = diff / uMinYearly;

    return Math.max(0, 100 - (percentDiff * 100));
  }

  private calculateWorkTypeMatch(userTypes: string[], jobType: string, isRemote: boolean): number {
    if (!userTypes.length) return 100;

    const jType = jobType.toLowerCase();
    let hit = false;

    userTypes.forEach(ut => {
      const u = ut.toLowerCase();
      if (u === 'remote' && isRemote) hit = true;
      if (jType.includes(u)) hit = true;
    });

    return hit ? 100 : 40;
  }

  // Simplified strict filtering
  private calculateIndustryMatch(userInd: string[], jobInd: string): number {
    if (!userInd.length) return 100;
    const jInd = (jobInd || '').toLowerCase();
    return userInd.some(i => jInd.includes(i.toLowerCase())) ? 100 : 20;
  }

  private calculateCompanySizeMatch(userSizes: string[], jobSize: any): number {
    if (!userSizes.length) return 100;
    const jSize = (jobSize || '').toString().toLowerCase();

    // Map user labels to approximate checks
    const matches = userSizes.some(s => {
      if (s.includes('Startup') && (jSize.includes('1-10') || jSize.includes('1-50') || jSize === 'small')) return true;
      if (s.includes('Medium') && (jSize.includes('51-') || jSize.includes('medium'))) return true;
      if (s.includes('Large') && (jSize.includes('500+') || jSize.includes('1000+') || jSize === 'enterprise')) return true;
      return false;
    });

    return matches ? 100 : 40;
  }

  private calculateListMatch(userList: string[], jobList: string[]): number {
    if (!userList.length) return 100;
    if (!jobList || !jobList.length) return 30;

    const overlap = userList.filter(u => jobList.some(j => j.toLowerCase().includes(u.toLowerCase())));
    return Math.min(100, (overlap.length / Math.min(3, userList.length)) * 100);
  }

  // Helper
  private convertToYearly(amount: number, period: string): number {
    switch (period?.toLowerCase()) {
      case 'hourly': return amount * 2080; // 40hrs * 52wks
      case 'weekly': return amount * 52;
      case 'monthly': return amount * 12;
      default: return amount;
    }
  }

  /**
   * Experience Match
   */
  private calculateExperienceMatch(userLevel: string, jobLevel: string): number {
    const levels = ['Entry Level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director'];
    const uIdx = levels.indexOf(userLevel);
    const jIdx = levels.indexOf(jobLevel);

    if (uIdx === -1 || jIdx === -1) return 70; // Default if data is missing/malformed

    const diff = Math.abs(uIdx - jIdx);
    if (diff === 0) return 100;
    if (diff === 1) return 85;
    if (diff === 2) return 60;
    return Math.max(0, 100 - (diff * 25));
  }

  /**
   * Main Matching Function
   */
  public matchJobs(userPreferences: any, jobs: any[]): JobMatchScore[] {
    return jobs.map(job => {
      // 1. Calculate Individual Components
      const roleMatch = this.calculateRoleMatch(userPreferences.desiredRoles || [], job.title, job.category);
      const techStackMatch = this.calculateTechStackMatch(userPreferences.desiredRoles || [], job.description || '', job.skills || []);
      const descriptionMatch = this.calculateDescriptionMatch(userPreferences.desiredRoles || [], job.description || '');

      const locationMatch = this.calculateLocationMatch(userPreferences.locations || [], job.location, job.isRemote || job.remote);
      const salaryMatch = this.calculateSalaryMatch(
        userPreferences.salaryMin, userPreferences.salaryMax, userPreferences.salaryPeriod,
        job.salaryMin, job.salaryMax, job.salaryPeriod
      );

      const experienceMatch = this.calculateExperienceMatch(
        userPreferences.experienceLevel || 'Mid-level',
        job.experience || job.experienceLevel || 'Mid-level'
      );
      const workTypeMatch = this.calculateWorkTypeMatch(userPreferences.workType || [], job.employmentType || job.jobType || '', job.isRemote || job.remote);
      const industryMatch = this.calculateIndustryMatch(userPreferences.industries || [], job.industry);
      const companySizeMatch = this.calculateCompanySizeMatch(userPreferences.companySize || [], job.companySize || job.company?.size);

      const benefitsMatch = this.calculateListMatch(userPreferences.benefits || [], job.benefits);
      const growthMatch = this.calculateListMatch(userPreferences.growthOpportunities || [], job.growthOpportunities);

      // 2. Weighted Aggregation
      const overallScore =
        (roleMatch * this.weights.role) +
        (techStackMatch * this.weights.techStack) +
        (descriptionMatch * this.weights.description) +
        (locationMatch * this.weights.location) +
        (salaryMatch * this.weights.salary) +
        (experienceMatch * this.weights.experience) +
        (workTypeMatch * this.weights.workType) +
        (industryMatch * this.weights.industry) +
        (companySizeMatch * this.weights.companySize) +
        (benefitsMatch * this.weights.benefits);

      // 3. Generate Insightful Reasons
      const matchReasons = this.generateMatchReasons({ roleMatch, techStackMatch, salaryMatch, locationMatch }, job);

      return {
        job,
        overallScore: Math.round(overallScore),
        breakdown: {
          roleMatch: Math.round(roleMatch),
          techStackMatch: Math.round(techStackMatch),
          descriptionMatch: Math.round(descriptionMatch),
          locationMatch: Math.round(locationMatch),
          salaryMatch: Math.round(salaryMatch),
          experienceMatch: Math.round(experienceMatch),
          workTypeMatch: Math.round(workTypeMatch),
          skillsMatch: Math.round(techStackMatch), // Alias for UI
          industryMatch: Math.round(industryMatch),
          companySizeMatch: Math.round(companySizeMatch),
          benefitsMatch: Math.round(benefitsMatch),
          growthMatch: Math.round(growthMatch)
        },
        matchReasons
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  private generateMatchReasons(scores: any, job: any): string[] {
    const reasons: string[] = [];
    if (scores.roleMatch >= 90) reasons.push("Top Role Match");
    if (scores.techStackMatch >= 80) reasons.push("Strong Tech Stack Alignment");
    if (scores.salaryMatch >= 100) reasons.push("Matches Salary Expectations");
    if (scores.locationMatch >= 100) reasons.push("Perfect Location");
    if (job.isRemote || job.remote) reasons.push("Remote Opportunity");
    return reasons.slice(0, 3);
  }
}