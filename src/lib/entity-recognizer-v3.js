// ========================================
// ENTITY RECOGNIZER V3 (Iterations 21-30)
// Named Entity Recognition (NER): People, Organizations, Locations, Dates
// ========================================

class EntityRecognizerV3 {
    constructor() {
        // Common patterns for entity recognition
        this.entityPatterns = {
            // Person names - common patterns
            personIndicators: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'CEO', 'Director', 'Manager'],
            personTriggers: ['said', 'mentioned', 'told', 'emailed', 'reported', 'called'],

            // Organization patterns
            orgSuffixes: ['Inc.', 'Ltd.', 'LLC', 'Corp.', 'Company', 'Group', 'Foundation', 'University'],
            orgIndicators: ['our team', 'the company', 'the department', 'the organization'],

            // Location patterns
            countries: ['USA', 'UK', 'Japan', 'Germany', 'France', 'China', 'India', 'Australia', 'Brazil', 'Canada', 'Mexico', 'Sweden'],
            cities: ['New York', 'London', 'Tokyo', 'Berlin', 'Paris', 'Beijing', 'Delhi', 'Sydney', 'Toronto', 'Stockholm'],
            locationTriggers: ['in', 'at', 'from', 'to', 'across'],

            // Date/Time patterns
            months: ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'],
            timeUnits: ['today', 'tomorrow', 'yesterday', 'next week', 'last month', 'this quarter'],
            relativeTime: ['ASAP', 'immediately', 'urgent', 'ongoing', 'recurring']
        };

        // Entity categories
        this.entityTypes = {
            PERSON: 'Person',
            ORGANIZATION: 'Organization',
            LOCATION: 'Location',
            DATE: 'Date',
            PRODUCT: 'Product',
            MONEY: 'Money',
            PERCENT: 'Percentage',
            FACILITY: 'Facility'
        };
    }

    /**
     * Recognize all entities in text
     */
    recognizeEntities(text) {
        const entities = {
            persons: [],
            organizations: [],
            locations: [],
            dates: [],
            products: [],
            money: [],
            percentages: [],
            facilities: [],
            allEntities: []
        };

        // Recognize each entity type
        entities.persons = this.recognizePersons(text);
        entities.organizations = this.recognizeOrganizations(text);
        entities.locations = this.recognizeLocations(text);
        entities.dates = this.recognizeDates(text);
        entities.products = this.recognizeProducts(text);
        entities.money = this.recognizeMoney(text);
        entities.percentages = this.recognizePercentages(text);
        entities.facilities = this.recognizeFacilities(text);

        // Combine all entities
        entities.allEntities = [
            ...entities.persons,
            ...entities.organizations,
            ...entities.locations,
            ...entities.dates,
            ...entities.products,
            ...entities.money,
            ...entities.percentages,
            ...entities.facilities
        ].sort((a, b) => a.position - b.position);

        entities.entityCount = entities.allEntities.length;
        entities.entityDensity = Math.round((entities.entityCount / text.split(/\s+/).length) * 100);

        return entities;
    }

    /**
     * Recognize person names and references
     */
    recognizePersons(text) {
        const persons = [];
        const words = text.split(/\s+/);

        // Pattern 1: Title + Name
        for (let i = 0; i < words.length - 1; i++) {
            if (this.entityPatterns.personIndicators.some(indicator => 
                words[i].includes(indicator))) {
                const nextWord = words[i + 1];
                if (this.isProperNoun(nextWord)) {
                    persons.push({
                        entity: `${words[i]} ${nextWord}`,
                        type: this.entityTypes.PERSON,
                        confidence: 85,
                        category: 'person_with_title',
                        role: words[i],
                        position: i
                    });
                }
            }
        }

        // Pattern 2: Capitalized words (potential names)
        for (let i = 0; i < words.length; i++) {
            if (this.isProperNoun(words[i]) && !persons.some(p => p.entity.includes(words[i]))) {
                // Check if preceded by person trigger
                if (i > 0 && this.entityPatterns.personTriggers.some(trigger => 
                    words[i - 1].toLowerCase().includes(trigger.toLowerCase()))) {
                    persons.push({
                        entity: words[i],
                        type: this.entityTypes.PERSON,
                        confidence: 70,
                        category: 'person_mentioned',
                        context: words[i - 1],
                        position: i
                    });
                }
            }
        }

        return persons;
    }

    /**
     * Recognize organization names
     */
    recognizeOrganizations(text) {
        const organizations = [];
        const words = text.split(/\s+/);

        // Pattern: Name + Org Suffix
        for (let i = 0; i < words.length - 1; i++) {
            if (this.entityPatterns.orgSuffixes.some(suffix => 
                words[i + 1].includes(suffix))) {
                organizations.push({
                    entity: `${words[i]} ${words[i + 1]}`,
                    type: this.entityTypes.ORGANIZATION,
                    confidence: 90,
                    suffix: words[i + 1],
                    position: i
                });
            }
        }

        // Pattern: "the company" or "our team"
        const phrases = text.split(/\s+/);
        for (let i = 0; i < phrases.length - 1; i++) {
            const twoWord = `${phrases[i]} ${phrases[i + 1]}`.toLowerCase();
            if (this.entityPatterns.orgIndicators.some(indicator => 
                twoWord.includes(indicator.toLowerCase()))) {
                organizations.push({
                    entity: `${phrases[i]} ${phrases[i + 1]}`,
                    type: this.entityTypes.ORGANIZATION,
                    confidence: 75,
                    category: 'org_reference',
                    position: i
                });
            }
        }

        return organizations;
    }

    /**
     * Recognize locations
     */
    recognizeLocations(text) {
        const locations = [];
        const lowerText = text.toLowerCase();

        // Check for countries
        for (const country of this.entityPatterns.countries) {
            if (text.includes(country)) {
                const index = text.indexOf(country);
                locations.push({
                    entity: country,
                    type: this.entityTypes.LOCATION,
                    category: 'country',
                    confidence: 95,
                    position: index
                });
            }
        }

        // Check for cities
        for (const city of this.entityPatterns.cities) {
            if (text.includes(city)) {
                const index = text.indexOf(city);
                locations.push({
                    entity: city,
                    type: this.entityTypes.LOCATION,
                    category: 'city',
                    confidence: 90,
                    position: index
                });
            }
        }

        return locations;
    }

    /**
     * Recognize dates and time expressions
     */
    recognizeDates(text) {
        const dates = [];
        const words = text.split(/\s+/);

        // Pattern 1: Month + Day + Year
        for (let i = 0; i < words.length - 2; i++) {
            if (this.entityPatterns.months.includes(words[i])) {
                const possibleDate = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
                dates.push({
                    entity: possibleDate,
                    type: this.entityTypes.DATE,
                    category: 'absolute_date',
                    confidence: 85,
                    position: i
                });
            }
        }

        // Pattern 2: Relative time expressions
        for (const timeUnit of this.entityPatterns.timeUnits) {
            if (text.includes(timeUnit)) {
                const index = text.indexOf(timeUnit);
                dates.push({
                    entity: timeUnit,
                    type: this.entityTypes.DATE,
                    category: 'relative_time',
                    confidence: 80,
                    position: index
                });
            }
        }

        // Pattern 3: Absolute time indicators
        for (const relTime of this.entityPatterns.relativeTime) {
            if (text.includes(relTime)) {
                const index = text.indexOf(relTime);
                dates.push({
                    entity: relTime,
                    type: this.entityTypes.DATE,
                    category: 'urgency_indicator',
                    semanticMeaning: 'high_priority',
                    confidence: 88,
                    position: index
                });
            }
        }

        return dates;
    }

    /**
     * Recognize product/project names
     */
    recognizeProducts(text) {
        const products = [];
        
        // Look for capitalized terms that often indicate products
        const words = text.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            if (this.isProperNoun(words[i])) {
                // Additional context check
                if ((i > 0 && ['project', 'product', 'system', 'tool', 'solution'].some(word =>
                    words[i - 1].toLowerCase().includes(word))) ||
                    (i < words.length - 1 && ['project', 'product', 'system', 'tool', 'solution'].some(word =>
                    words[i + 1].toLowerCase().includes(word)))) {
                    
                    products.push({
                        entity: words[i],
                        type: this.entityTypes.PRODUCT,
                        confidence: 75,
                        position: i
                    });
                }
            }
        }

        return products;
    }

    /**
     * Recognize money amounts
     */
    recognizeMoney(text) {
        const moneyPattern = /\$\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars|USD|EUR|GBP|JPY)/gi;
        const matches = text.match(moneyPattern) || [];

        return matches.map((match, idx) => ({
            entity: match,
            type: this.entityTypes.MONEY,
            confidence: 95,
            numericalValue: this.extractNumberFromMoney(match),
            position: idx
        }));
    }

    /**
     * Recognize percentages
     */
    recognizePercentages(text) {
        const percentPattern = /\d+(?:\.\d+)?%/g;
        const matches = text.match(percentPattern) || [];

        return matches.map((match, idx) => ({
            entity: match,
            type: this.entityTypes.PERCENT,
            confidence: 98,
            numericalValue: parseFloat(match),
            position: idx
        }));
    }

    /**
     * Recognize facilities/buildings
     */
    recognizeFacilities(text) {
        const facilities = [];
        const facilityKeywords = ['office', 'lab', 'facility', 'headquarters', 'center', 'campus', 'building'];

        const words = text.split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
            if (facilityKeywords.some(keyword => words[i].toLowerCase().includes(keyword))) {
                if (this.isProperNoun(words[i + 1])) {
                    facilities.push({
                        entity: `${words[i]} ${words[i + 1]}`,
                        type: this.entityTypes.FACILITY,
                        facilityType: words[i],
                        confidence: 80,
                        position: i
                    });
                }
            }
        }

        return facilities;
    }

    /**
     * Check if word is a proper noun (capitalized)
     */
    isProperNoun(word) {
        return /^[A-Z]/.test(word) && word.length > 1;
    }

    /**
     * Extract numerical value from money string
     */
    extractNumberFromMoney(moneyString) {
        const numbers = moneyString.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            return parseInt(numbers[0]);
        }
        return 0;
    }

    /**
     * Get entity summary for display
     */
    getEntitySummary(entities) {
        return {
            personCount: entities.persons.length,
            organizationCount: entities.organizations.length,
            locationCount: entities.locations.length,
            dateCount: entities.dates.length,
            totalMoney: this.sumMoney(entities.money),
            averageConfidence: Math.round(
                entities.allEntities.reduce((sum, e) => sum + e.confidence, 0) / 
                Math.max(entities.allEntities.length, 1)
            ),
            entityProfile: {
                formal: entities.organizationCount > 0 || entities.persons.length > 2,
                timeConstrained: entities.dates.length > 0,
                locationSpecific: entities.locations.length > 0,
                monetaryInvolvement: entities.money.length > 0
            }
        };
    }

    /**
     * Sum up total money mentioned
     */
    sumMoney(moneyEntities) {
        return moneyEntities.reduce((sum, money) => sum + money.numericalValue, 0);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EntityRecognizerV3;
}
