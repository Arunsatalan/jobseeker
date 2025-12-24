// Modern Job Matching Algorithm - 2025 Strategy
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
  };
  matchReasons: string[];
}

export class JobMatchingEngine {
  // Weights for different matching factors (totals 100%)
  private weights = {
    role: 0.30,        // 30% - Most important
    skills: 0.25,      // 25% - Very important for tech roles
    salary: 0.20,      // 20% - Financial compatibility
    location: 0.15,    // 15% - Geographic preference
    experience: 0.10,  // 10% - Experience level matching
  };

  /**
   * Advanced String Similarity using Levenshtein + Fuzzy Logic
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    
    // Levenshtein distance
    const levenshtein = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = ((maxLength - levenshtein) / maxLength) * 100;
    
    // Bonus for keyword matching
    const keywords1 = s1.split(/\s+/);
    const keywords2 = s2.split(/\s+/);
    const keywordMatches = keywords1.filter(k1 => 
      keywords2.some(k2 => k2.includes(k1) || k1.includes(k2))
    ).length;
    
    const keywordBonus = (keywordMatches / Math.max(keywords1.length, keywords2.length)) * 20;
    
    return Math.min(100, similarity + keywordBonus);
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

  /**
   * Role/Title Matching with Semantic Understanding
   */
  private calculateRoleMatch(userRoles: string[], jobTitle: string, jobCategory?: string): number {
    if (!userRoles.length) return 50; // Neutral score if no preferences
    
    const jobTitleLower = jobTitle.toLowerCase();
    const jobCategoryLower = jobCategory?.toLowerCase() || '';
    
    let bestMatch = 0;
    
    for (const role of userRoles) {
      const roleLower = role.toLowerCase();
      
      // Direct title match
      const titleScore = this.calculateStringSimilarity(roleLower, jobTitleLower);
      
      // Category match
      const categoryScore = jobCategory ? 
        this.calculateStringSimilarity(roleLower, jobCategoryLower) * 0.7 : 0;
      
      // Keyword extraction and matching
      const roleKeywords = this.extractUniversalKeywords(roleLower);
      const jobKeywords = this.extractUniversalKeywords(jobTitleLower + ' ' + jobCategoryLower);
      const keywordScore = this.calculateKeywordOverlap(roleKeywords, jobKeywords) * 80;
      
      const combinedScore = Math.max(titleScore, categoryScore, keywordScore);
      bestMatch = Math.max(bestMatch, combinedScore);
    }
    
    return bestMatch;
  }

  /**
   * Advanced Skills Matching with Tech Stack Analysis
   */
  private calculateSkillsMatch(userRoles: string[], jobSkills: string[], jobDescription: string): number {
    // Extract expected skills from user roles
    const expectedSkills = this.extractSkillsFromRoles(userRoles);
    
    // Extract skills from job posting
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const descriptionSkills = this.extractUniversalKeywords(jobDescription.toLowerCase());
    const allJobSkills = [...new Set([...jobSkillsLower, ...descriptionSkills])];
    
    if (expectedSkills.length === 0) return 60; // Neutral if no role specified
    
    let matchedSkills = 0;
    let totalSkillWeight = 0;
    
    for (const expectedSkill of expectedSkills) {
      const weight = this.getSkillImportanceWeight(expectedSkill);
      totalSkillWeight += weight;
      
      const hasMatch = allJobSkills.some(jobSkill => 
        this.calculateStringSimilarity(expectedSkill, jobSkill) > 70
      );
      
      if (hasMatch) {
        matchedSkills += weight;
      }
    }
    
    return totalSkillWeight > 0 ? (matchedSkills / totalSkillWeight) * 100 : 60;
  }

  /**
   * Location Matching with Geographic Intelligence
   */
  private calculateLocationMatch(userLocations: string[], jobLocation: string, isRemote: boolean): number {
    if (isRemote) return 100; // Remote jobs match everyone
    if (!userLocations.length) return 70; // Neutral if no preference
    
    const jobLocationLower = jobLocation.toLowerCase();
    let bestMatch = 0;
    
    for (const userLoc of userLocations) {
      const userLocLower = userLoc.toLowerCase();
      
      // Exact match
      if (userLocLower === jobLocationLower) return 100;
      
      // City/Province matching
      const similarity = this.calculateStringSimilarity(userLocLower, jobLocationLower);
      
      // Geographic proximity bonus (same province/state)
      const userParts = userLocLower.split(',').map(p => p.trim());
      const jobParts = jobLocationLower.split(',').map(p => p.trim());
      
      let proximityBonus = 0;
      if (userParts.length > 1 && jobParts.length > 1) {
        // Check province/state match
        if (userParts[1] === jobParts[1]) proximityBonus = 30;
      }
      
      bestMatch = Math.max(bestMatch, similarity + proximityBonus);
    }
    
    return Math.min(100, bestMatch);
  }

  /**
   * Salary Compatibility with Market Intelligence
   */
  private calculateSalaryMatch(
    userSalaryMin: number, 
    userSalaryMax: number, 
    userPeriod: string,
    jobSalaryMin?: number, 
    jobSalaryMax?: number,
    jobPeriod?: string
  ): number {
    if (!jobSalaryMin || !jobSalaryMax) return 60; // Neutral if no salary info
    
    // Convert all salaries to yearly for comparison
    const userYearlyMin = this.convertToYearly(userSalaryMin, userPeriod);
    const userYearlyMax = this.convertToYearly(userSalaryMax, userPeriod);
    const jobYearlyMin = this.convertToYearly(jobSalaryMin, jobPeriod || 'yearly');
    const jobYearlyMax = this.convertToYearly(jobSalaryMax, jobPeriod || 'yearly');
    
    // Calculate overlap percentage
    const overlapStart = Math.max(userYearlyMin, jobYearlyMin);
    const overlapEnd = Math.min(userYearlyMax, jobYearlyMax);
    
    if (overlapEnd < overlapStart) {
      // No overlap - calculate distance penalty
      const gap = Math.min(
        Math.abs(userYearlyMin - jobYearlyMax),
        Math.abs(userYearlyMax - jobYearlyMin)
      );
      
      const avgSalary = (userYearlyMin + userYearlyMax + jobYearlyMin + jobYearlyMax) / 4;
      const gapPercentage = (gap / avgSalary) * 100;
      
      return Math.max(0, 100 - gapPercentage);
    }
    
    // Calculate overlap quality
    const overlapSize = overlapEnd - overlapStart;
    const userRange = userYearlyMax - userYearlyMin;
    const jobRange = jobYearlyMax - jobYearlyMin;
    const avgRange = (userRange + jobRange) / 2;
    
    const overlapScore = (overlapSize / avgRange) * 100;
    return Math.min(100, overlapScore);
  }

  /**
   * Experience Level Matching with Career Progression Logic
   */
  private calculateExperienceMatch(userExperienceLevel: string, jobExperienceLevel: string): number {
    const experienceOrder = ['Entry Level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director'];
    
    const userIndex = experienceOrder.indexOf(userExperienceLevel);
    const jobIndex = experienceOrder.indexOf(jobExperienceLevel);
    
    if (userIndex === -1 || jobIndex === -1) return 70; // Neutral for unknown levels
    
    const diff = Math.abs(userIndex - jobIndex);
    
    // Perfect match
    if (diff === 0) return 100;
    
    // Adjacent levels (good match)
    if (diff === 1) return 85;
    
    // Two levels apart (decent match)
    if (diff === 2) return 65;
    
    // More than two levels apart
    return Math.max(30, 100 - (diff * 15));
  }

  /**
   * Work Type Matching
   */
  private calculateWorkTypeMatch(userWorkTypes: string[], jobEmploymentType: string, isRemote: boolean): number {
    if (!userWorkTypes.length) return 70; // Neutral if no preference
    
    const jobType = jobEmploymentType.toLowerCase();
    let bestMatch = 0;
    
    for (const userType of userWorkTypes) {
      const userTypeLower = userType.toLowerCase();
      
      // Handle remote preference
      if (userTypeLower === 'remote' && isRemote) return 100;
      if (userTypeLower === 'hybrid' && isRemote) bestMatch = Math.max(bestMatch, 85);
      
      // Employment type matching
      const similarity = this.calculateStringSimilarity(userTypeLower, jobType);
      bestMatch = Math.max(bestMatch, similarity);
    }
    
    return bestMatch;
  }

  /**
   * Main Matching Function
   */
  public matchJobs(userPreferences: any, jobs: any[]): JobMatchScore[] {
    const matchedJobs = jobs.map(job => {
      const roleMatch = this.calculateRoleMatch(
        userPreferences.desiredRoles || [], 
        job.title, 
        job.category
      );
      
      const skillsMatch = this.calculateSkillsMatch(
        userPreferences.desiredRoles || [], 
        job.skills || [], 
        job.description || ''
      );
      
      const locationMatch = this.calculateLocationMatch(
        userPreferences.locations || [], 
        job.location, 
        job.isRemote || job.remote || false
      );
      
      const salaryMatch = this.calculateSalaryMatch(
        userPreferences.salaryMin || 0,
        userPreferences.salaryMax || 999999,
        userPreferences.salaryPeriod || 'yearly',
        job.salaryMin,
        job.salaryMax,
        job.salaryPeriod
      );
      
      const experienceMatch = this.calculateExperienceMatch(
        userPreferences.experienceLevel || 'Mid-level',
        job.experience || job.experienceLevel || 'Mid-level'
      );
      
      const workTypeMatch = this.calculateWorkTypeMatch(
        userPreferences.workType || [],
        job.employmentType || job.jobType || 'full-time',
        job.isRemote || job.remote || false
      );
      
      // Calculate weighted overall score
      const overallScore = 
        (roleMatch * this.weights.role) +
        (skillsMatch * this.weights.skills) +
        (salaryMatch * this.weights.salary) +
        (locationMatch * this.weights.location) +
        (experienceMatch * this.weights.experience);
      
      // Generate match reasons
      const matchReasons = this.generateMatchReasons({
        roleMatch,
        skillsMatch,
        locationMatch,
        salaryMatch,
        experienceMatch,
        workTypeMatch
      }, job, userPreferences);
      
      return {
        job,
        overallScore: Math.round(overallScore),
        breakdown: {
          roleMatch: Math.round(roleMatch),
          locationMatch: Math.round(locationMatch),
          salaryMatch: Math.round(salaryMatch),
          experienceMatch: Math.round(experienceMatch),
          workTypeMatch: Math.round(workTypeMatch),
          skillsMatch: Math.round(skillsMatch)
        },
        matchReasons
      };
    });
    
    // Sort by overall score (best matches first)
    return matchedJobs.sort((a, b) => b.overallScore - a.overallScore);
  }

  // Helper methods
  private convertToYearly(amount: number, period: string): number {
    switch (period?.toLowerCase()) {
      case 'hourly': return amount * 40 * 52;
      case 'weekly': return amount * 52;
      case 'monthly': return amount * 12;
      case 'yearly':
      default: return amount;
    }
  }

  private extractUniversalKeywords(text: string): string[] {
    const universalKeywords = [
      // Technology & IT
      'javascript', 'typescript', 'python', 'java', 'c#', 'php', 'ruby', 'go', 'rust',
      'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'spring',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'mongodb', 'postgresql', 'mysql',
      'redux', 'graphql', 'api', 'microservices', 'devops', 'ci/cd', 'git', 'agile',
      'machine learning', 'ai', 'data science', 'analytics', 'big data', 'spark',
      'frontend', 'backend', 'fullstack', 'mobile', 'ios', 'android', 'flutter',
      
      // Business & Management
      'management', 'leadership', 'strategy', 'planning', 'budgeting', 'project management',
      'team lead', 'director', 'executive', 'operations', 'business development',
      'sales', 'marketing', 'client relations', 'stakeholder management', 'scrum',
      
      // Healthcare & Medical
      'nursing', 'medical', 'healthcare', 'patient care', 'clinical', 'hospital',
      'surgery', 'diagnosis', 'treatment', 'pharmacy', 'medical records', 'emr',
      'hipaa', 'cpr', 'first aid', 'medical terminology', 'anatomy', 'physiology',
      
      // Finance & Accounting
      'accounting', 'bookkeeping', 'financial analysis', 'budgeting', 'forecasting',
      'tax preparation', 'audit', 'compliance', 'risk management', 'investment',
      'banking', 'insurance', 'quickbooks', 'excel', 'financial reporting', 'gaap',
      
      // Education & Training
      'teaching', 'instruction', 'curriculum', 'lesson planning', 'classroom management',
      'student assessment', 'educational technology', 'tutoring', 'training', 'mentoring',
      'learning management', 'pedagogy', 'special education', 'early childhood',
      
      // Marketing & Communications
      'digital marketing', 'social media', 'content creation', 'seo', 'sem', 'ppc',
      'email marketing', 'brand management', 'advertising', 'copywriting', 'analytics',
      'google analytics', 'facebook ads', 'content strategy', 'public relations',
      
      // Sales & Customer Service
      'sales', 'customer service', 'crm', 'lead generation', 'cold calling', 'negotiations',
      'customer retention', 'account management', 'retail', 'upselling', 'cross-selling',
      'customer satisfaction', 'salesforce', 'hubspot', 'pipeline management',
      
      // Manufacturing & Operations
      'manufacturing', 'production', 'quality control', 'supply chain', 'logistics',
      'warehouse', 'inventory management', 'lean manufacturing', 'six sigma', 'safety',
      'equipment operation', 'maintenance', 'assembly', 'packaging', 'shipping',
      
      // Construction & Trades
      'construction', 'carpentry', 'plumbing', 'electrical', 'welding', 'hvac',
      'roofing', 'painting', 'drywall', 'flooring', 'masonry', 'blueprint reading',
      'power tools', 'safety regulations', 'building codes', 'project estimation',
      
      // Hospitality & Food Service
      'hospitality', 'customer service', 'food service', 'restaurant', 'hotel',
      'cooking', 'food preparation', 'serving', 'bartending', 'housekeeping',
      'front desk', 'reservations', 'pos systems', 'food safety', 'sanitation',
      
      // Transportation & Logistics
      'driving', 'cdl', 'logistics', 'delivery', 'shipping', 'transportation',
      'route planning', 'fleet management', 'warehouse', 'forklift', 'inventory',
      'supply chain', 'dispatch', 'freight', 'customs', 'hazmat',
      
      // Creative & Design
      'design', 'graphic design', 'web design', 'ui/ux', 'photoshop', 'illustrator',
      'indesign', 'figma', 'sketch', 'creative suite', 'branding', 'typography',
      'photography', 'video editing', 'animation', 'art direction', 'creative writing',
      
      // Legal & Compliance
      'legal', 'law', 'litigation', 'contracts', 'compliance', 'regulatory',
      'paralegal', 'legal research', 'case management', 'court proceedings',
      'legal writing', 'intellectual property', 'corporate law', 'family law',
      
      // Human Resources
      'human resources', 'recruiting', 'talent acquisition', 'employee relations',
      'payroll', 'benefits administration', 'performance management', 'training',
      'onboarding', 'compliance', 'labor relations', 'compensation', 'hris',
      
      // General Professional Skills
      'communication', 'problem solving', 'analytical', 'detail oriented', 'organized',
      'time management', 'multitasking', 'teamwork', 'interpersonal', 'adaptable',
      'customer focused', 'results driven', 'professional', 'reliable', 'punctual'
    ];
    
    return universalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase()) || 
      text.toLowerCase().includes(keyword.replace(/\s+/g, '').toLowerCase())
    );
  }

  private extractSkillsFromRoles(roles: string[]): string[] {
    const universalRoleSkillMap: { [key: string]: string[] } = {
      // Technology & IT
      'software engineer': ['javascript', 'python', 'java', 'git', 'api', 'database', 'problem solving'],
      'frontend developer': ['javascript', 'react', 'vue', 'angular', 'html', 'css', 'ui/ux'],
      'backend developer': ['node', 'python', 'java', 'api', 'database', 'microservices'],
      'fullstack developer': ['javascript', 'react', 'node', 'api', 'database', 'git'],
      'data scientist': ['python', 'machine learning', 'analytics', 'big data', 'sql'],
      'devops engineer': ['docker', 'kubernetes', 'aws', 'ci/cd', 'git', 'microservices'],
      'mobile developer': ['mobile', 'ios', 'android', 'flutter', 'react native'],
      
      // Business & Management
      'manager': ['leadership', 'team management', 'budgeting', 'planning', 'communication'],
      'project manager': ['project management', 'planning', 'coordination', 'scrum', 'agile'],
      'business analyst': ['analytical', 'problem solving', 'communication', 'excel', 'documentation'],
      'account manager': ['client relations', 'sales', 'communication', 'crm', 'customer service'],
      
      // Healthcare & Medical
      'nurse': ['patient care', 'medical', 'clinical', 'healthcare', 'cpr', 'medical terminology'],
      'medical assistant': ['patient care', 'medical records', 'scheduling', 'medical terminology'],
      'pharmacy technician': ['pharmacy', 'medication', 'customer service', 'attention to detail'],
      'healthcare administrator': ['healthcare', 'administration', 'medical records', 'hipaa'],
      
      // Finance & Accounting
      'accountant': ['accounting', 'bookkeeping', 'excel', 'financial reporting', 'gaap', 'tax preparation'],
      'financial analyst': ['financial analysis', 'excel', 'budgeting', 'forecasting', 'analytical'],
      'bookkeeper': ['bookkeeping', 'accounting', 'quickbooks', 'data entry', 'detail oriented'],
      'tax preparer': ['tax preparation', 'accounting', 'customer service', 'attention to detail'],
      
      // Education & Training
      'teacher': ['teaching', 'curriculum', 'classroom management', 'lesson planning', 'communication'],
      'trainer': ['training', 'presentation', 'communication', 'mentoring', 'instructional design'],
      'tutor': ['tutoring', 'teaching', 'communication', 'patience', 'subject expertise'],
      'education administrator': ['administration', 'education', 'leadership', 'planning', 'budgeting'],
      
      // Marketing & Communications
      'marketing manager': ['marketing', 'digital marketing', 'campaign management', 'analytics', 'leadership'],
      'social media manager': ['social media', 'content creation', 'analytics', 'marketing', 'creativity'],
      'content creator': ['content creation', 'writing', 'creativity', 'social media', 'marketing'],
      'seo specialist': ['seo', 'analytics', 'content strategy', 'digital marketing', 'technical writing'],
      
      // Sales & Customer Service
      'sales representative': ['sales', 'communication', 'negotiation', 'customer service', 'crm'],
      'customer service representative': ['customer service', 'communication', 'problem solving', 'patience'],
      'retail associate': ['customer service', 'sales', 'retail', 'communication', 'cash handling'],
      'inside sales': ['sales', 'lead generation', 'crm', 'cold calling', 'communication'],
      
      // Manufacturing & Operations
      'production worker': ['manufacturing', 'quality control', 'safety', 'teamwork', 'reliability'],
      'warehouse worker': ['warehouse', 'inventory', 'forklift', 'shipping', 'physical stamina'],
      'quality control': ['quality control', 'attention to detail', 'manufacturing', 'inspection'],
      'operations manager': ['operations', 'leadership', 'planning', 'supply chain', 'management'],
      
      // Construction & Trades
      'carpenter': ['carpentry', 'construction', 'blueprint reading', 'power tools', 'manual labor'],
      'electrician': ['electrical', 'construction', 'safety', 'blueprint reading', 'troubleshooting'],
      'plumber': ['plumbing', 'construction', 'troubleshooting', 'customer service', 'manual labor'],
      'construction worker': ['construction', 'manual labor', 'safety', 'teamwork', 'reliability'],
      
      // Hospitality & Food Service
      'server': ['customer service', 'food service', 'communication', 'multitasking', 'teamwork'],
      'cook': ['cooking', 'food preparation', 'food safety', 'teamwork', 'time management'],
      'hotel clerk': ['customer service', 'hospitality', 'front desk', 'reservations', 'communication'],
      'bartender': ['bartending', 'customer service', 'multitasking', 'communication', 'cash handling'],
      
      // Transportation & Logistics
      'driver': ['driving', 'customer service', 'time management', 'reliability', 'safety'],
      'delivery driver': ['driving', 'delivery', 'customer service', 'navigation', 'time management'],
      'logistics coordinator': ['logistics', 'coordination', 'supply chain', 'planning', 'communication'],
      'dispatch': ['dispatch', 'communication', 'coordination', 'multitasking', 'problem solving'],
      
      // Creative & Design
      'graphic designer': ['graphic design', 'creative suite', 'creativity', 'branding', 'typography'],
      'web designer': ['web design', 'html', 'css', 'ui/ux', 'photoshop', 'creativity'],
      'photographer': ['photography', 'creativity', 'photo editing', 'customer service', 'artistic vision'],
      'video editor': ['video editing', 'creativity', 'storytelling', 'technical skills', 'attention to detail'],
      
      // Legal & Compliance
      'paralegal': ['legal research', 'legal writing', 'case management', 'attention to detail'],
      'legal assistant': ['legal', 'administration', 'communication', 'organization', 'confidentiality'],
      'compliance officer': ['compliance', 'regulatory', 'analytical', 'attention to detail', 'communication'],
      
      // Human Resources
      'hr generalist': ['human resources', 'employee relations', 'recruiting', 'training', 'communication'],
      'recruiter': ['recruiting', 'talent acquisition', 'communication', 'networking', 'interviewing'],
      'hr coordinator': ['human resources', 'coordination', 'administration', 'communication', 'organization'],
      
      // General/Entry Level
      'assistant': ['administration', 'communication', 'organization', 'multitasking', 'computer skills'],
      'receptionist': ['customer service', 'communication', 'phone skills', 'organization', 'multitasking'],
      'data entry': ['data entry', 'attention to detail', 'typing', 'computer skills', 'accuracy'],
      'administrative assistant': ['administration', 'organization', 'communication', 'computer skills', 'multitasking']
    };
    
    const skills: string[] = [];
    for (const role of roles) {
      const roleLower = role.toLowerCase();
      for (const [key, roleSkills] of Object.entries(universalRoleSkillMap)) {
        if (roleLower.includes(key) || key.includes(roleLower)) {
          skills.push(...roleSkills);
        }
      }
    }
    
    return [...new Set(skills)];
  }

  private getSkillImportanceWeight(skill: string): number {
    // High importance skills across all industries
    const highImportanceSkills = [
      'communication', 'customer service', 'leadership', 'management', 'problem solving',
      'javascript', 'python', 'java', 'react', 'node', 'aws', // Tech
      'sales', 'marketing', 'accounting', 'nursing', 'teaching', // Industry-specific critical
      'project management', 'analytical', 'teamwork', 'reliability'
    ];
    
    // Medium importance skills
    const mediumImportanceSkills = [
      'git', 'api', 'database', 'docker', 'sql', // Tech
      'excel', 'crm', 'scheduling', 'training', 'coordination', // Business
      'patient care', 'food safety', 'construction', 'driving', // Industry-specific
      'organization', 'multitasking', 'attention to detail'
    ];
    
    if (highImportanceSkills.includes(skill.toLowerCase())) return 3;
    if (mediumImportanceSkills.includes(skill.toLowerCase())) return 2;
    return 1;
  }

  private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const overlap = keywords1.filter(k1 => 
      keywords2.some(k2 => k1 === k2 || k1.includes(k2) || k2.includes(k1))
    ).length;
    
    return overlap / Math.max(keywords1.length, keywords2.length);
  }

  private generateMatchReasons(scores: any, job: any, preferences: any): string[] {
    const reasons: string[] = [];
    
    if (scores.roleMatch > 80) {
      reasons.push(`Strong match for ${preferences.desiredRoles?.join(', ')} role`);
    }
    
    if (scores.skillsMatch > 80) {
      reasons.push('Excellent skills alignment');
    }
    
    if (scores.salaryMatch > 85) {
      reasons.push('Salary range matches your expectations');
    }
    
    if (scores.locationMatch > 90) {
      reasons.push('Perfect location match');
    } else if (job.isRemote || job.remote) {
      reasons.push('Remote work opportunity');
    }
    
    if (scores.experienceMatch > 85) {
      reasons.push('Experience level is a great fit');
    }
    
    return reasons;
  }
}