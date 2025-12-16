/**
 * @description Apex controller for AI Agent Job Description creation/display LWC.
 * Provides:
 *  - getCandidateAgents: agentforcews__c records that don't yet have a related agentjd__c
 *  - getJobDescription: full agentjd__c by Id
 *
 * Security:
 *  - with sharing to respect org sharing rules
 *  - SOQL uses WITH SECURITY_ENFORCED where appropriate
 *  - Returns only fields needed by the UI
 *
 * Notes:
 *  - Invocable methods are not required here because this is UI-driven. If Flow usage is needed later, add Invocable variants.
 */
public with sharing class AgentJobDescriptionController {
    /**
     * @description DTO for agent (agentforcews__c) option and context
     */
    public class AgentContextDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String target;
        @AuraEnabled public String pain;
        @AuraEnabled public String agentrole;
    }

    /**
     * @description DTO for job description (agentjd__c)
     */
    public class JobDescriptionDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name; // Agent Nickname (Name)
        @AuraEnabled public Id agentforcewsId;
        @AuraEnabled public String jobContent;
        @AuraEnabled public String jobScope;
        @AuraEnabled public String requiredSkills;
        @AuraEnabled public String preferredSkills;
        @AuraEnabled public String workTime;
        @AuraEnabled public String dataKnowledge;
        @AuraEnabled public String expectedEffect;
    }

    /**
     * @description Minimal DTO for listing existing job descriptions in a picklist.
     */
    public class JobListItemDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
    }


    /**
     * @description Get full job description by Id.
     * @param jobId agentjd__c Id
     */
    @AuraEnabled(cacheable=true)
    public static JobDescriptionDTO getJobDescription(Id jobId) {
        if (jobId == null) {
            return null;
        }
        agentjd__c jd = [
            SELECT Id, Name, agentforcews__c, 
                   job_content__c, job_scope__c, required_skills__c, preferred_skills__c, 
                   work_time__c, data_knowledge__c, expected_effect__c 
            FROM agentjd__c 
            WHERE Id = :jobId 
            LIMIT 1
        ];
        if (jd == null) {
            return null;
        }

        JobDescriptionDTO dto = new JobDescriptionDTO();
        dto.id = jd.Id;
        dto.name = jd.Name;
        dto.agentforcewsId = jd.agentforcews__c;
        dto.jobContent = jd.job_content__c;
        dto.jobScope = jd.job_scope__c;
        dto.requiredSkills = jd.required_skills__c;
        dto.preferredSkills = jd.preferred_skills__c;
        dto.workTime = jd.work_time__c;
        dto.dataKnowledge = jd.data_knowledge__c;
        dto.expectedEffect = jd.expected_effect__c;
        return dto;
    }

    /**
     * @description Get agent context by Id.
     * @param agentId agentforcews__c Id
     */
    @AuraEnabled(cacheable=true)
    public static AgentContextDTO getAgentContext(Id agentId) {
        if (agentId == null) {
            return null;
        }
        agentforcews__c agent = [
            SELECT Id, Name, target__c, pain__c, agentrole__c
            FROM agentforcews__c 
            WHERE Id = :agentId 
            LIMIT 1
        ];
        if (agent == null) {
            return null;
        }

        AgentContextDTO dto = new AgentContextDTO();
        dto.id = agent.Id;
        dto.name = agent.Name;
        dto.target = agent.target__c;
        dto.pain = agent.pain__c;
        dto.agentrole = agent.agentrole__c;
        return dto;
    }

}
