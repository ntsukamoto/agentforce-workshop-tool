/**
 * @description Apex controller for Agentforce Workshop LWC to fetch recent ideas.
 * Provides cacheable method to retrieve agentforcews__c records ordered by CreatedDate DESC.
 * Security:
 *  - with sharing to respect org sharing rules
 *  - WITH SECURITY_ENFORCED to enforce FLS and object permissions
 *  - Returns only required fields
 * Notes:
 *  - Designed for use with @wire in LWC
 */
public with sharing class AgentWorkshopController {
    public class AgentDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String target;
        @AuraEnabled public String pain;
        @AuraEnabled public String agentRole;

        public AgentDTO(agentforcews__c rec) {
            this.id = rec.Id;
            this.name = rec.Name;
            this.target = (String)rec.get('target__c');
            this.pain = (String)rec.get('pain__c');
            this.agentRole = (String)rec.get('agentrole__c');
        }
    }

    /**
     * @description Returns latest agentforcews__c ideas ordered by CreatedDate DESC.
     * @return List<AgentDTO> list of records with required fields only
     */
    @AuraEnabled(cacheable=true)
    public static List<AgentDTO> getAgents() {
        // Return early if no access; query with security enforced will throw if no object access
        List<AgentDTO> results = new List<AgentDTO>();
        for (agentforcews__c rec : [
            SELECT Id, Name, target__c, pain__c, agentrole__c
            FROM agentforcews__c
            WITH SECURITY_ENFORCED
            ORDER BY CreatedDate DESC
            LIMIT 200
        ]) {
            results.add(new AgentDTO(rec));
        }
        return results;
    }
}