// ─────────────────────────────────────────────────────────────────────────────
// PILOT — CISA Core Content Pack
// Curated coverage of all five CISA domains (2024 job practice areas), bundled
// as seed content so the platform is useful from the very first session.
// Domain weights mirror ISACA's official exam blueprint.
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainMeta {
  id: string;
  name: string;
  short: string;
  weight: number;
  color: string;
  blurb: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: "1",
    name: "Information Systems Auditing Process",
    short: "Auditing Process",
    weight: 18,
    color: "#4DD7FD",
    blurb: "Planning and executing risk-based IS audits in line with ISACA standards.",
  },
  {
    id: "2",
    name: "Governance & Management of IT",
    short: "Governance",
    weight: 18,
    color: "#A78BFA",
    blurb: "How IT is directed, controlled, and aligned to create business value.",
  },
  {
    id: "3",
    name: "IS Acquisition, Development & Implementation",
    short: "Acquisition & Dev",
    weight: 12,
    color: "#FBBF24",
    blurb: "Building, buying, testing, and implementing systems the right way.",
  },
  {
    id: "4",
    name: "IS Operations & Business Resilience",
    short: "Operations & Resilience",
    weight: 26,
    color: "#34D399",
    blurb: "Running IT services and keeping the business alive through disruption.",
  },
  {
    id: "5",
    name: "Protection of Information Assets",
    short: "Information Asset Protection",
    weight: 26,
    color: "#F472B6",
    blurb: "Security architecture, access control, and defending information assets.",
  },
];

export function domainMeta(id: string | null | undefined): DomainMeta | undefined {
  return DOMAINS.find((d) => d.id === id);
}

// ─── Key points (core) ───────────────────────────────────────────────────────
export const CORE_KEY_POINTS: { domain: string; text: string }[] = [
  // Domain 1
  { domain: "1", text: "The ISACA ITAF framework distinguishes Standards (mandatory requirements), Guidelines (recommended how-to guidance), and Tools & Techniques (optional examples) — only Standards are mandatory." },
  { domain: "1", text: "A risk-based audit plan concentrates limited audit resources on the areas presenting the greatest risk to the organization, rather than spreading coverage evenly." },
  { domain: "1", text: "Audit risk is the combination of inherent risk, control risk, and detection risk; when inherent and control risk are high, the auditor must set detection risk low and perform more substantive testing." },
  { domain: "1", text: "Compliance testing determines whether controls operate as designed and prescribed; substantive testing verifies the actual accuracy, completeness, and validity of transactions and balances." },
  { domain: "1", text: "Attribute sampling (estimating rates of exception) suits compliance testing, while variables sampling (estimating amounts) suits substantive testing; higher confidence levels or lower precision demands larger samples." },
  { domain: "1", text: "The most reliable audit evidence generally comes from independent external sources received directly by the auditor; auditor-observed firsthand evidence is stronger than internally generated documentation." },
  { domain: "1", text: "The IS audit charter — approved at the board/audit-committee level — documents the purpose, responsibility, authority, and accountability of the audit function and is the foundation of auditor independence." },
  { domain: "1", text: "Continuous auditing embeds automated tests and exception reporting into systems, providing near-real-time assurance and earlier detection of control failures than periodic audits." },
  { domain: "1", text: "Before an audit report is finalized, findings should be validated with the auditee to confirm factual accuracy; disagreements are presented objectively in the final report." },
  { domain: "1", text: "When materiality is assessed as lower, more evidence and testing are required; when acceptable audit risk increases, less audit evidence is needed — the two drive testing effort in opposite directions." },
  // Domain 2
  { domain: "2", text: "IT governance is the responsibility of the board of directors and executive management and focuses on value delivery, risk management, resource optimization, and performance measurement." },
  { domain: "2", text: "Strategic alignment means IT plans and investments are derived from and demonstrably support business strategy; the IT steering committee prioritizes projects from a business-value perspective." },
  { domain: "2", text: "The governance document hierarchy runs from top-level Policies, to mandatory Standards, to detailed step-by-step Procedures, with Guidelines serving as optional recommended practices." },
  { domain: "2", text: "The data owner classifies information and decides who may access it; the data custodian implements and maintains the technical controls that enforce those decisions; accountability remains with the owner." },
  { domain: "2", text: "When segregation of duties is not feasible — especially in small IT shops — compensating controls such as independent review of audit logs, reconciliation, and increased supervision must be established." },
  { domain: "2", text: "A service level agreement must define measurable performance targets (availability, response times, recovery times) with clear responsibility and remedies; unmeasurable guarantees are worthless." },
  { domain: "2", text: "Outsourcing transfers execution, never accountability — the organization retains responsibility for risk, so contracts, right-to-audit clauses, and ongoing vendor monitoring are essential." },
  { domain: "2", text: "Key risk indicators (KRIs) are leading indicators that warn of rising risk before loss occurs, while KPIs measure performance after the fact; both belong on the IT balanced scorecard." },
  { domain: "2", text: "COBIT is ISACA's framework for the governance and management of enterprise IT, connecting business goals to IT goals and the enablers — processes, practices, structures, culture — that achieve them." },
  { domain: "2", text: "An effective information security governance program starts with a security strategy owned by senior management, cascaded into policies, and reinforced by metrics and periodic independent review." },
  // Domain 3
  { domain: "3", text: "The feasibility study, performed early in the SDLC, determines whether the proposed system is viable technically, economically, legally, operationally, and on schedule — it is the primary go/no-go control." },
  { domain: "3", text: "User acceptance testing verifies the system against business requirements in conditions as close to production as possible and must be owned by end users, not developers or IT." },
  { domain: "3", text: "Parallel implementation runs the old and new systems together and is the safest, least risky cutover method, though it is the most resource-intensive; phased rollout limits exposure to a subset of users or sites." },
  { domain: "3", text: "The critical path is the longest sequence of dependent activities in the project network and determines the minimum possible project duration; its tasks carry zero slack (float)." },
  { domain: "3", text: "Scope creep is most often caused by poorly defined initial requirements combined with weak change control; every change request should pass impact analysis and formal approval before work begins." },
  { domain: "3", text: "Regression testing re-verifies that changes, fixes, or enhancements have not introduced new defects into previously working functionality; it should be repeatable and increasingly automated." },
  { domain: "3", text: "Prototyping accelerates requirement discovery through early visual feedback but risks bypassing formal controls, producing weak documentation, and releasing unfinished prototypes into production." },
  { domain: "3", text: "In agile methods, scope flexes while time and cost are fixed in fixed-length iterations (timeboxes); close business involvement replaces heavy up-front documentation, which is itself a control concern." },
  { domain: "3", text: "White-box testing is based on knowledge of the program's internal logic and structure; black-box testing validates only inputs and outputs against requirements with no view of the internals." },
  { domain: "3", text: "Data conversion is the highest-risk moment of many implementations — the key controls are reconciliation of control totals, completeness and accuracy verification, and an audit trail of converted records." },
  // Domain 4
  { domain: "4", text: "Recovery Time Objective (RTO) is the target time within which a business process or technology must be restored after disruption; Recovery Point Objective (RPO) defines the maximum tolerable data loss as a point in time." },
  { domain: "4", text: "A hot site is fully configured and continuously maintained for immediate takeover (fastest, most expensive); warm sites are partially configured; cold sites provide space and utilities only (cheapest, slowest)." },
  { domain: "4", text: "A Business Impact Analysis quantifies financial and operational impact over time for each process, producing the RTOs and RPOs that the entire continuity and recovery design is built upon." },
  { domain: "4", text: "Incremental backups copy only data changed since the last backup of any type (fastest backup, slowest restore); differential backups copy everything changed since the last full backup (slower backup, faster restore)." },
  { domain: "4", text: "A full-interruption test is the most comprehensive continuity test because it actually exercises the recovery, but it is the most disruptive and expensive; paper/checklist walkthroughs are the least disruptive and least conclusive." },
  { domain: "4", text: "An incident is anything that degrades service; a problem is the underlying (often unknown) root cause of one or more incidents — problem management eliminates causes, incident management restores service fast." },
  { domain: "4", text: "Reciprocal agreements between organizations to share facilities in a disaster are cheap but fragile: they are difficult to enforce, depend on compatible configurations, and collapse if both parties are hit." },
  { domain: "4", text: "A UPS bridges short power interruptions and conditions line power so systems can be shut down gracefully; only a generator sustains operations through extended outages." },
  { domain: "4", text: "Recommended data-center environment: roughly 21°C (70°F) with 45–55% relative humidity — low humidity promotes electrostatic discharge; high humidity promotes corrosion of components." },
  { domain: "4", text: "RAID-1 mirrors disks for full redundancy; RAID-5 stripes data with distributed parity and tolerates one drive failure; RAID-0 stripes for speed only and provides no fault tolerance." },
  // Domain 5
  { domain: "5", text: "In asymmetric encryption, encrypting with the recipient's public key provides confidentiality, while encrypting (signing) with the sender's private key provides authenticity and nonrepudiation." },
  { domain: "5", text: "A hash function is one-way and produces a fixed-length digest — it provides integrity, never confidentiality; passwords must be salted before hashing to defeat rainbow tables." },
  { domain: "5", text: "The crossover error rate (CER), where false acceptance equals false rejection, measures overall biometric accuracy — the lower the CER, the more accurate the biometric system." },
  { domain: "5", text: "Least privilege grants users only the access required for their duties; role-based access control implements need-to-know at scale and simplifies consistent provisioning and removal." },
  { domain: "5", text: "Phishing casts wide nets, spear phishing is targeted and researched, whaling targets senior executives — the single most effective countermeasure is continual security awareness training." },
  { domain: "5", text: "Packet-filtering firewalls inspect source/destination addresses and ports only; stateful inspection tracks session context; application-level (proxy) firewalls fully terminate connections and inspect content." },
  { domain: "5", text: "An intrusion detection system (IDS) passively monitors and alerts; an intrusion prevention system (IPS) sits inline and can block traffic in real time — a compromised IDS is passive by design." },
  { domain: "5", text: "Tailgating (following an authorized person through a controlled door) defeats badge systems; mantraps, security guards, turnstiles, and awareness training are the standard countermeasures." },
  { domain: "5", text: "Kerberos uses symmetric keys and tickets issued by a Key Distribution Center and depends on synchronized clocks; TACACS+ encrypts the entire authentication payload (RADIUS encrypts only the password) and is preferred for device administration." },
  { domain: "5", text: "Degaussing erases magnetic media only — it is useless against SSDs, which require cryptographic erase or physical destruction; printed confidential material belongs in cross-cut shredding." },
];

// ─── Flashcards (core) ───────────────────────────────────────────────────────
export const CORE_FLASHCARDS: { domain: string; front: string; back: string }[] = [
  { domain: "1", front: "Standards vs Guidelines (ITAF)", back: "Standards are mandatory requirements for IS audit and assurance; Guidelines provide advice on applying them and are not mandatory." },
  { domain: "1", front: "Audit Risk Model", back: "Audit risk = Inherent risk × Control risk × Detection risk. High inherent/control risk forces low detection risk → more substantive testing." },
  { domain: "1", front: "Compliance test vs Substantive test", back: "Compliance: do controls operate as prescribed? Substantive: are the actual transactions/balances accurate and valid?" },
  { domain: "1", front: "Attribute sampling", back: "Statistical sampling that estimates a rate of occurrence (exceptions) — used in compliance testing of controls." },
  { domain: "1", front: "Most reliable audit evidence", back: "Evidence obtained from an independent external source and received directly by the auditor." },
  { domain: "1", front: "IS audit charter", back: "Board/audit-committee-approved document defining the audit function's purpose, responsibility, authority, accountability; anchor of independence." },
  { domain: "1", front: "Detection risk", back: "The risk that audit procedures fail to detect a material error — the only risk the auditor directly controls by doing more/fewer tests." },
  { domain: "1", front: "Continuous auditing", back: "Automated, ongoing auditing embedded in systems; delivers timely, near-real-time detection of anomalies and control failures." },
  { domain: "2", front: "IT governance — whose job?", back: "The board of directors and executive management (not the CIO or audit); it ensures value delivery, risk mgmt, resource optimization, performance measurement." },
  { domain: "2", front: "Policy → Standard → Procedure", back: "Policy: high-level management intent. Standard: mandatory rule supporting the policy. Procedure: detailed step-by-step instructions. Guideline: optional advice." },
  { domain: "2", front: "Data owner vs data custodian", back: "Owner: classifies data & authorizes access (business role, accountable). Custodian: implements & maintains the technical controls per the owner's rules." },
  { domain: "2", front: "IT steering committee", back: "Cross-functional body that prioritizes IT projects and investments based on business needs and strategic alignment." },
  { domain: "2", front: "Segregation of duties — small shop", back: "When SoD is impossible, deploy compensating controls: independent review of audit logs, supervisory review, reconciliation." },
  { domain: "2", front: "KRI vs KPI", back: "KRI = leading indicator of emerging risk; KPI = lagging measure of performance against targets." },
  { domain: "2", front: "SLA essentials", back: "Measurable performance targets (availability, response, recovery), roles/responsibilities, remedies for breach, right-to-audit where relevant." },
  { domain: "2", front: "Outsourcing & accountability", back: "Work can be outsourced; accountability cannot. Demand contracts with security requirements, audit rights, and monitoring." },
  { domain: "3", front: "SDLC go/no-go control", back: "The feasibility study: technical, economic, legal, operational, and schedule viability assessed before major investment." },
  { domain: "3", front: "UAT — who and why", back: "Owned by end users; verifies the system meets business requirements and works under realistic conditions before go-live." },
  { domain: "3", front: "Parallel implementation", back: "Old and new systems run simultaneously until the new one proves itself — safest cutover, highest resource cost." },
  { domain: "3", front: "Critical path", back: "Longest chain of dependent tasks; sets minimum project duration; zero float/slack on its activities." },
  { domain: "3", front: "Scope creep root cause", back: "Poorly defined requirements + weak change control. Control: impact analysis and formal approval for every change." },
  { domain: "3", front: "Regression testing", back: "Re-testing after changes to prove previously working functionality was not broken by the change." },
  { domain: "3", front: "Prototyping risk", back: "Fast requirement discovery, but weak documentation, bypassed controls, and prototypes leaking into production." },
  { domain: "3", front: "White-box vs black-box testing", back: "White-box: tests internal logic/structure (needs code knowledge). Black-box: tests inputs→outputs against requirements only." },
  { domain: "4", front: "RTO vs RPO", back: "RTO: how fast must we be back? (max tolerable downtime). RPO: how much data can we lose? (max tolerable point-in-time gap)." },
  { domain: "4", front: "Hot vs warm vs cold site", back: "Hot: fully configured, immediate, costly. Warm: partially configured. Cold: space/power only, cheapest & slowest." },
  { domain: "4", front: "Business Impact Analysis", back: "Quantifies impact over time per process → produces RTO/RPO targets that drive the entire continuity design." },
  { domain: "4", front: "Incremental vs differential backup", back: "Incremental: changes since last backup of any type (fast backup, slow restore). Differential: changes since last full (grows, faster restore)." },
  { domain: "4", front: "Most comprehensive DRP test", back: "Full-interruption (live failover) — most disruptive and costly, but the only true proof of recovery capability." },
  { domain: "4", front: "Incident vs problem", back: "Incident: restore service fast (a symptom). Problem: the root cause of one or many incidents; problem mgmt removes causes." },
  { domain: "4", front: "UPS vs generator", back: "UPS bridges short outages and allows graceful shutdown; generator sustains operations through extended outages." },
  { domain: "4", front: "RAID quick map", back: "RAID-0 striping (speed, no tolerance), RAID-1 mirroring, RAID-5 striping + distributed parity (survives 1 disk)." },
  { domain: "5", front: "Public/private key usage", back: "Recipient's public key → confidentiality. Sender's private key (signed) → authenticity + nonrepudiation." },
  { domain: "5", front: "Hash function", back: "One-way, fixed-length digest for integrity (and password storage, with salt). Never provides confidentiality." },
  { domain: "5", front: "CER (Crossover Error Rate)", back: "Point where FAR = FRR; overall biometric accuracy metric — lower CER = more accurate." },
  { domain: "5", front: "Phishing spectrum", back: "Phishing: mass. Spear phishing: researched/targeted person. Whaling: targets senior executives. Vishing: voice. Smishing: SMS." },
  { domain: "5", front: "Firewall generations", back: "Packet filter (addresses/ports) → stateful inspection (session context) → application proxy (terminates connection, inspects content) — most secure, slower." },
  { domain: "5", front: "IDS vs IPS", back: "IDS is passive: monitors and alerts. IPS is inline: blocks malicious traffic in real time." },
  { domain: "5", front: "Tailgating / piggybacking", back: "Following an authorized person through a controlled door. Countermeasures: mantrap, guards, turnstiles, awareness." },
  { domain: "5", front: "Kerberos essentials", back: "Symmetric-key authentication using tickets from a KDC; requires time synchronization; supports SSO." },
  { domain: "5", front: "Media sanitization", back: "Degaussing works on magnetic media only. SSDs need cryptographic erase or physical destruction." },
  { domain: "5", front: "Least privilege", back: "Grant only the access needed to perform assigned duties — enforced via RBAC, need-to-know, and periodic access reviews." },
];

// ─── MCQ bank (core) ─────────────────────────────────────────────────────────
export interface CoreQuestion {
  domain: string;
  q: string;
  o: [string, string, string, string];
  a: 0 | 1 | 2 | 3;
  x: string;
  d: 1 | 2 | 3;
}

export const CORE_QUESTIONS: CoreQuestion[] = [
  // ── Domain 1 ──
  {
    domain: "1", d: 2, a: 2,
    q: "The PRIMARY advantage of a risk-based approach to IS audit planning is that it:",
    o: [
      "Guarantees that all material fraud will be detected during the engagement",
      "Eliminates the need for substantive testing in low-risk areas",
      "Directs audit resources toward the areas of highest risk to the organization",
      "Reduces the need for IS auditor professional judgment",
    ],
    x: "Risk-based planning allocates scarce audit resources to the highest-risk areas. It does not guarantee fraud detection or eliminate substantive testing, and it relies heavily on auditor judgment.",
  },
  {
    domain: "1", d: 2, a: 1,
    q: "An IS auditor wants to estimate the rate of exception in a population to conclude whether a control operates effectively. The MOST appropriate sampling technique is:",
    o: [
      "Variables sampling",
      "Attribute sampling",
      "Monetary unit sampling for balances",
      "Quota sampling",
    ],
    x: "Attribute sampling estimates rates of occurrence (exceptions) and is designed for compliance testing. Variables/monetary sampling estimate amounts and are used for substantive testing.",
  },
  {
    domain: "1", d: 1, a: 0,
    q: "Under the ISACA IT Audit and Assurance Framework (ITAF), compliance with which of the following is MANDATORY for IS audit professionals?",
    o: [
      "Standards",
      "Guidelines",
      "Tools and Techniques documents",
      "COBIT control practices",
    ],
    x: "ITAF Standards are mandatory; Guidelines are recommended guidance and Tools & Techniques are optional examples.",
  },
  {
    domain: "1", d: 2, a: 3,
    q: "An IS auditor assesses inherent risk and control risk as HIGH for a key process. The auditor should respond by:",
    o: [
      "Reducing the extent of substantive testing to save time",
      "Relying primarily on management representations",
      "Setting detection risk high and sampling fewer items",
      "Setting detection risk low and increasing substantive testing",
    ],
    x: "When inherent and control risk are high, detection risk must be set low. Low detection risk requires more (and more reliable) substantive evidence.",
  },
  {
    domain: "1", d: 2, a: 1,
    q: "Which of the following provides the GREATEST threat to an IS auditor's independence?",
    o: [
      "Reporting administratively to the chief operating officer",
      "Auditing a system the auditor helped design and implement",
      "Using audit software developed in-house",
      "Co-sourcing fieldwork with an external firm",
    ],
    x: "Auditing one's own work is a classic self-review threat that destroys independence. Administrative reporting lines are weaker but less severe; tooling and co-sourcing don't impair independence.",
  },
  {
    domain: "1", d: 1, a: 2,
    q: "The IS audit charter should be approved by the:",
    o: ["Chief information officer", "IS audit manager", "Board of directors / audit committee", "Chief financial officer"],
    x: "The charter documents purpose, responsibility, authority, and accountability and must be approved at the highest level — the board or audit committee — to underpin independence.",
  },
  {
    domain: "1", d: 2, a: 0,
    q: "Which of the following is generally considered the MOST reliable form of audit evidence?",
    o: [
      "Confirmation of balances received directly by the auditor from an external party",
      "Internally prepared reconciliations reviewed by department management",
      "Verbal statements from process owners",
      "System-generated exception reports supplied by the application team",
    ],
    x: "Externally sourced evidence received directly by the auditor is the most reliable: independent origin plus no chance of tampering in transit.",
  },
  {
    domain: "1", d: 2, a: 3,
    q: "The KEY benefit the organization gains from continuous auditing techniques is:",
    o: [
      "Elimination of the annual external audit",
      "Lower fees for the internal audit function",
      "Replacement of controls with automated reporting",
      "Near-real-time detection of control failures and anomalies",
    ],
    x: "Continuous auditing embeds automated tests in systems for timely, near-real-time detection — it complements, not replaces, periodic audits and existing controls.",
  },
  {
    domain: "1", d: 1, a: 1,
    q: "Before finalizing an audit report, the IS auditor should FIRST validate draft findings with the auditee primarily to:",
    o: [
      "Give management a chance to remove unfavorable findings",
      "Confirm the factual accuracy of the findings",
      "Negotiate a higher materiality threshold",
      "Satisfy documentation retention requirements",
    ],
    x: "Findings are reviewed with the auditee to verify factual accuracy. Disagreements are not suppressed — they are presented objectively in the final report.",
  },
  {
    domain: "1", d: 3, a: 2,
    q: "If an IS auditor determines that a LOWER level of materiality is appropriate for an engagement, the auditor should:",
    o: [
      "Reduce the sample sizes used in substantive tests",
      "Raise the assessed level of control risk",
      "Increase the extent of audit testing",
      "Shorten fieldwork to maintain a fixed budget",
    ],
    x: "Lower materiality means even smaller misstatements matter, so more persuasive evidence and more extensive testing are required.",
  },
  // ── Domain 2 ──
  {
    domain: "2", d: 1, a: 1,
    q: "Ultimate responsibility for the governance of enterprise IT rests with the:",
    o: ["Chief information officer", "Board of directors and executive management", "Internal audit function", "IT steering committee"],
    x: "IT governance is the responsibility of the board and executive management; the CIO, steering committee, and internal audit support but do not own it.",
  },
  {
    domain: "2", d: 2, a: 0,
    q: "The PRIMARY role of an IT steering committee is to:",
    o: [
      "Prioritize and approve IT projects and investments based on business value",
      "Develop the detailed technical architecture for new systems",
      "Perform user acceptance testing for major releases",
      "Manage day-to-day IT service operations",
    ],
    x: "Steering committees align IT investment with business strategy and prioritize from a business-value perspective. Detailed design and operations belong to delivery teams.",
  },
  {
    domain: "2", d: 2, a: 3,
    q: "Who should hold PRIMARY responsibility for approving which users may access a sensitive dataset?",
    o: ["The system administrator", "The data custodian", "The information security officer", "The data owner"],
    x: "The data owner classifies the information and authorizes access; custodians implement the technical controls; security advises and monitors.",
  },
  {
    domain: "2", d: 1, a: 2,
    q: "In the information security governance document hierarchy, which of the following contains MANDATORY, specific control requirements supporting a policy?",
    o: ["Procedure", "Guideline", "Standard", "Charter"],
    x: "Standards are the mandatory, specific controls that enforce policies. Procedures are step-by-step instructions; guidelines are optional recommendations.",
  },
  {
    domain: "2", d: 2, a: 1,
    q: "In a small IT department where one administrator must perform incompatible duties, the BEST compensating control is:",
    o: [
      "Giving the administrator a second account for sensitive tasks",
      "Independent review of the administrator's audit logs by someone outside IS",
      "Requiring the administrator to sign a confidentiality agreement",
      "Outsourcing all administration to a managed service provider",
    ],
    x: "When segregation of duties is infeasible, compensating controls such as independent log review and supervision reduce the risk. NDAs do not prevent or detect misuse.",
  },
  {
    domain: "2", d: 2, a: 0,
    q: "Which of the following is the MOST critical element of a service level agreement (SLA) with an IT service provider?",
    o: [
      "Measurable performance metrics with defined targets and remedies",
      "A guarantee of 100% service availability",
      "The provider's marketing references and certifications",
      "A clause allowing the provider to change terms with notice",
    ],
    x: "SLAs must contain measurable metrics, targets, responsibilities, and remedies. '100% availability' guarantees are typically unachievable and unmeasurable promises are unenforceable.",
  },
  {
    domain: "2", d: 3, a: 3,
    q: "An organization outsources its payroll processing. From a governance perspective, accountability for the payroll process:",
    o: [
      "Transfers entirely to the outsourcing provider",
      "Transfers to the external auditor of the provider",
      "Is shared equally under the service contract",
      "Remains with the organization's management",
    ],
    x: "You can outsource execution but never accountability. Management retains responsibility and must demand contracts, audit rights, and ongoing vendor monitoring.",
  },
  {
    domain: "2", d: 2, a: 2,
    q: "Key risk indicators (KRIs) differ from key performance indicators (KPIs) in that KRIs:",
    o: [
      "Are always quantitative financial measures",
      "Measure performance against objectives after the fact",
      "Are leading indicators that warn of emerging risk before losses occur",
      "Are relevant only to information security, not governance",
    ],
    x: "KRIs are forward-looking (leading) indicators used to manage risk; KPIs are backward-looking (lagging) measures of performance.",
  },
  {
    domain: "2", d: 1, a: 1,
    q: "COBIT is BEST described as a framework for:",
    o: [
      "Performing substantive tests on financial systems",
      "The governance and management of enterprise information and technology",
      "Certifying technical security controls for cloud providers",
      "Managing software development lifecycles for startups",
    ],
    x: "COBIT is ISACA's framework for governance and management of enterprise IT, linking business goals to IT goals and their enablers.",
  },
  {
    domain: "2", d: 2, a: 0,
    q: "Achieving strategic alignment between IT and the business is BEST evidenced when:",
    o: [
      "IT plans and investments are demonstrably derived from the business strategy",
      "The IT budget is reduced to match last year's actuals",
      "IT independently selects emerging technologies to pilot",
      "All IT decisions are escalated to the external auditor",
    ],
    x: "Strategic alignment means business strategy drives IT plans and investments. Cost-cutting, technology-first pilots, and auditor escalation are not evidence of alignment.",
  },
  // ── Domain 3 ──
  {
    domain: "3", d: 1, a: 2,
    q: "The purpose of a feasibility study in the SDLC is to:",
    o: [
      "Train end users on the planned system",
      "Define the detailed database schema",
      "Determine whether the proposed system is viable across technical, economic, legal, operational, and schedule dimensions",
      "Select the programming language for implementation",
    ],
    x: "The feasibility study is the early go/no-go control assessing viability on multiple dimensions before major investment is committed.",
  },
  {
    domain: "3", d: 1, a: 1,
    q: "The PRIMARY objective of user acceptance testing (UAT) is to verify that the system:",
    o: [
      "Is free of syntax errors and compiles cleanly",
      "Meets business requirements under realistic conditions, validated by end users",
      "Can handle the maximum projected transaction volume",
      "Passes technical code review by senior developers",
    ],
    x: "UAT validates the system against business requirements in near-production conditions and must be owned by end users, not developers.",
  },
  {
    domain: "3", d: 2, a: 3,
    q: "Which implementation approach provides the LOWEST risk of operational disruption during cutover, albeit at the highest resource cost?",
    o: ["Direct (big-bang) cutover", "Pilot implementation", "Phased implementation", "Parallel implementation"],
    x: "Running old and new systems in parallel is the lowest-risk cutover because the legacy system remains available as a fallback — but it requires operating two systems at once.",
  },
  {
    domain: "3", d: 2, a: 0,
    q: "In project management, the critical path is the:",
    o: [
      "Longest sequence of dependent activities that determines the minimum project duration",
      "Sequence of activities with the largest budget allocation",
      "Path with the greatest number of assigned resources",
      "Set of activities that management marked as most important",
    ],
    x: "The critical path is the longest dependent chain of activities with zero float; any slip on it slips the entire project.",
  },
  {
    domain: "3", d: 2, a: 2,
    q: "The MOST common root cause of scope creep in system development projects is:",
    o: [
      "Excessive use of formal change control",
      "Too many developers on the team",
      "Poorly defined requirements combined with inadequate change management",
      "Overly aggressive vendor contracts",
    ],
    x: "Vague requirements plus weak change control let unvalidated requests accumulate — the classic scope creep pattern. Strong change control prevents it.",
  },
  {
    domain: "3", d: 1, a: 1,
    q: "Regression testing is performed primarily to ensure that:",
    o: [
      "New functionality meets user requirements",
      "Changes have not introduced defects into previously working functionality",
      "The system architecture supports future scalability",
      "Documentation matches the delivered software",
    ],
    x: "Regression testing re-verifies existing functionality after changes or fixes, catching unintended side effects.",
  },
  {
    domain: "3", d: 2, a: 2,
    q: "The GREATEST control concern associated with prototyping as a development approach is that it:",
    o: [
      "Takes longer than traditional structured development",
      "Requires expensive specialized tools",
      "May bypass formal controls and documentation, and prototypes may be pushed to production unfinished",
      "Cannot be used for large information systems",
    ],
    x: "Prototyping's speed comes at the cost of weak documentation and skipped controls, plus the real-world risk of unfinished prototypes going live.",
  },
  {
    domain: "3", d: 2, a: 0,
    q: "White-box testing is distinguished from black-box testing in that white-box testing:",
    o: [
      "Is performed with knowledge of the program's internal logic and structure",
      "Focuses exclusively on user interface usability",
      "Can only be performed after the system is in production",
      "Requires no access to source code or design documents",
    ],
    x: "White-box (glass/clear box) tests internal logic with full knowledge of structure; black-box validates inputs and outputs against requirements without internal knowledge.",
  },
  {
    domain: "3", d: 2, a: 3,
    q: "During data conversion to a new system, the MOST important control objective is to ensure:",
    o: [
      "The conversion completes within the maintenance window",
      "Users are trained on the new interfaces first",
      "Legacy systems are decommissioned immediately",
      "Completeness and accuracy of converted data, with reconciliation and audit trails",
    ],
    x: "Conversion's highest risk is data corruption or loss — control totals reconciliation, completeness/accuracy verification, and audit trails are the key controls.",
  },
  {
    domain: "3", d: 3, a: 1,
    q: "In agile development, the practice of timeboxing means that:",
    o: [
      "Each team member logs hours against a task before starting it",
      "Work is delivered in fixed-length iterations with scope adjusted to fit the fixed time and cost",
      "Requirements are frozen permanently at project kickoff",
      "Testing is deferred to a single phase at the end of the project",
    ],
    x: "Timeboxing fixes time and cost per iteration; scope flexes to fit. Requirements evolve continuously and testing happens within each iteration.",
  },
  // ── Domain 4 ──
  {
    domain: "4", d: 1, a: 2,
    q: "The recovery time objective (RTO) represents the:",
    o: [
      "Point in time to which data must be restored after an incident",
      "Cost of recovering from a disaster",
      "Maximum tolerable time to restore a business process or system after a disruption",
      "Frequency with which recovery tests must be performed",
    ],
    x: "RTO is the maximum tolerable downtime for restoring a process/system; RPO governs tolerable data loss.",
  },
  {
    domain: "4", d: 1, a: 0,
    q: "The recovery point objective (RPO) is used to determine the:",
    o: [
      "Tolerable amount of data loss measured as a point in time",
      "Order in which applications are recovered",
      "Maximum acceptable downtime for a business process",
      "Frequency of disaster testing exercises",
    ],
    x: "RPO defines the point in time to which data must be recoverable — i.e., how much data the business can afford to lose, driving backup frequency.",
  },
  {
    domain: "4", d: 2, a: 3,
    q: "An organization needs its most critical systems resumable within minutes with no configuration effort at recovery time. The recovery site strategy that BEST meets this need is a:",
    o: ["Cold site", "Reciprocal agreement", "Warm site", "Hot site"],
    x: "A hot site is fully configured, continuously maintained, and mirrored — offering near-immediate takeover at the highest cost. Warm sites need partial setup; cold sites provide space only.",
  },
  {
    domain: "4", d: 2, a: 1,
    q: "The PRIMARY weakness of a reciprocal disaster recovery agreement between two companies is that it:",
    o: [
      "Is more expensive than a commercial hot site",
      "Cannot be reliably enforced and fails if both parties suffer the same disaster or configurations diverge",
      "Requires government approval to be legally binding",
      "Only works when both companies are in the same industry",
    ],
    x: "Reciprocal agreements are hard to enforce, fragile to configuration drift, and useless when a shared disaster (e.g., regional outage) hits both organizations.",
  },
  {
    domain: "4", d: 2, a: 0,
    q: "An incremental backup strategy copies files changed since:",
    o: [
      "The last backup of any type (full or incremental)",
      "The last full backup only",
      "The beginning of the calendar week",
      "The last user logoff from the system",
    ],
    x: "Incremental = changed since the most recent backup of any kind (fast backup, slower restore). Differential = changed since the last full backup.",
  },
  {
    domain: "4", d: 2, a: 2,
    q: "Which disaster recovery test provides the STRONGEST assurance that an organization can actually recover, at the cost of greatest disruption?",
    o: ["Checklist (paper) test", "Structured walkthrough", "Full-interruption test", "Simulation test"],
    x: "Full-interruption testing actually executes recovery live, proving capability end to end — but it disrupts operations and is the most expensive.",
  },
  {
    domain: "4", d: 1, a: 1,
    q: "The FIRST major activity in developing a business continuity plan is:",
    o: [
      "Negotiating offsite recovery facility contracts",
      "Conducting a business impact analysis",
      "Scheduling the first full-interruption test",
      "Writing end-user recovery procedures",
    ],
    x: "The BIA quantifies impact per business process over time and produces RTO/RPO targets that every subsequent continuity and recovery decision depends on.",
  },
  {
    domain: "4", d: 1, a: 2,
    q: "In IT service management, a problem differs from an incident in that a problem is:",
    o: [
      "Always more severe than any incident",
      "Logged by analysts, while incidents are logged by users",
      "The underlying root cause of one or more incidents",
      "Resolved permanently by restoring service quickly",
    ],
    x: "Incident management restores service fast; problem management investigates and removes root causes of one or more incidents.",
  },
  {
    domain: "4", d: 2, a: 0,
    q: "The PRIMARY reason for deploying an uninterruptible power supply (UPS) for a data center is to:",
    o: [
      "Bridge short outages and allow graceful shutdown, conditioning power",
      "Replace the need for a backup generator",
      "Reduce annual electricity costs",
      "Eliminate all risks of data loss during disasters",
    ],
    x: "A UPS covers brief power interruptions and smooths power so systems shut down gracefully; only a generator sustains operations through long outages.",
  },
  {
    domain: "4", d: 3, a: 1,
    q: "In a RAID-5 disk array, fault tolerance is achieved through:",
    o: [
      "Mirrored copies of all data on duplicate drives",
      "Striping data with distributed parity across the array, tolerating one drive failure",
      "Automatic nightly backups to tape",
      "Replication to a hot site over the network",
    ],
    x: "RAID-5 stripes data with distributed parity so any single drive can fail without data loss. Mirroring is RAID-1; backups and replication are different mechanisms.",
  },
  // ── Domain 5 ──
  {
    domain: "5", d: 2, a: 2,
    q: "To send a confidential message using asymmetric encryption, the sender encrypts the message with the:",
    o: ["Sender's private key", "Sender's public key", "Recipient's public key", "Recipient's private key"],
    x: "Confidentiality = encrypt with the recipient's public key; only their private key can decrypt. Signing with the sender's private key instead provides authenticity/nonrepudiation.",
  },
  {
    domain: "5", d: 2, a: 0,
    q: "A digital signature provides authenticity and nonrepudiation because the message digest is encrypted with the sender's:",
    o: ["Private key", "Public key", "Symmetric session key", "Certificate serial number"],
    x: "Only the sender holds the private key used to sign; anyone can verify with the public key, proving origin and preventing denial (nonrepudiation).",
  },
  {
    domain: "5", d: 2, a: 3,
    q: "The fundamental security property of a cryptographic hash function is that it is:",
    o: ["Reversible with a known key", "Slower than symmetric encryption", "Used to encrypt small messages", "One-way, producing a fixed-length digest that cannot be reversed"],
    x: "Hashing is one-way and fixed-length — it provides integrity, never confidentiality, which is why passwords are stored salted and hashed rather than encrypted.",
  },
  {
    domain: "5", d: 3, a: 1,
    q: "The overall accuracy of a biometric system is BEST measured by its:",
    o: [
      "Enrollment time",
      "Crossover error rate (CER) — where false acceptance equals false rejection",
      "False acceptance rate alone, regardless of false rejection",
      "Number of authorized users in the database",
    ],
    x: "The CER, where FAR equals FRR, summarizes biometric accuracy in one number; the lower the CER, the more accurate the system.",
  },
  {
    domain: "5", d: 1, a: 2,
    q: "A phishing campaign that specifically researches and targets a company's chief executive officer is known as:",
    o: ["Vishing", "Drive-by downloading", "Whaling", "Shoulder surfing"],
    x: "Whaling targets senior executives specifically. Spear phishing targets individuals more generally; vishing uses voice calls.",
  },
  {
    domain: "5", d: 2, a: 0,
    q: "The MOST effective countermeasure against social engineering attacks such as phishing and pretexting is:",
    o: ["Ongoing security awareness training and testing", "Increasing firewall rule complexity", "Mandating longer password minimums", "Encrypting the organization's public website"],
    x: "Social engineering exploits people, not technology — continuous awareness training with simulated phishing is the most effective control.",
  },
  {
    domain: "5", d: 2, a: 3,
    q: "Which firewall type provides the STRONGEST inspection because it terminates connections and examines application-layer content?",
    o: ["Packet-filtering router", "Stateful inspection firewall", "Circuit-level gateway", "Application-level proxy firewall"],
    x: "Application-level proxies fully terminate and rebuild connections, inspecting content — the strongest (and slowest) of the firewall generations.",
  },
  {
    domain: "5", d: 1, a: 1,
    q: "The KEY operational difference between an intrusion detection system (IDS) and an intrusion prevention system (IPS) is that an IPS:",
    o: [
      "Cannot generate alerts, only logs",
      "Sits inline and can actively block malicious traffic in real time",
      "Monitors traffic passively from a network tap",
      "Only works on encrypted traffic",
    ],
    x: "IDS passively monitors and alerts (often via a tap/SPAN port). IPS is inline and blocks in real time — powerful, but a false positive halts legitimate traffic.",
  },
  {
    domain: "5", d: 1, a: 2,
    q: "An attacker gains entry to a secure facility by following an employee through a badge-controlled door. This attack is called:",
    o: ["Dumpster diving", "Brute force entry", "Tailgating (piggybacking)", "Passback"],
    x: "Tailgating/piggybacking defeats badge readers via social trust. Countermeasures include mantraps, turnstiles, guards, and awareness.",
  },
  {
    domain: "5", d: 2, a: 0,
    q: "The principle of least privilege requires that users be granted:",
    o: [
      "Only the minimum access necessary to perform their assigned duties",
      "Administrative access so they can resolve their own problems",
      "The same access as the most senior person on their team",
      "Temporary full access that is reviewed only at termination",
    ],
    x: "Least privilege = minimum access needed for the job, typically implemented via RBAC plus need-to-know and periodic access reviews.",
  },
  {
    domain: "5", d: 3, a: 1,
    q: "When decommissioning solid-state drives (SSD) that stored classified data, the MOST reliable sanitization approach is:",
    o: [
      "Degaussing the drives with a strong magnet",
      "Cryptographic erasure or physical destruction of the drives",
      "Reformatting the drives using the operating system",
      "Overwriting the drives one time with zeros",
    ],
    x: "Degaussing works only on magnetic media and is useless against flash. SSDs need cryptographic erase or physical destruction; simple reformatting is insufficient.",
  },
  {
    domain: "5", d: 2, a: 2,
    q: "In a public key infrastructure (PKI), if a user's private key is compromised, the FIRST action should be to:",
    o: [
      "Delete the user's account and create a new identity",
      "Issue the user a new email certificate without further action",
      "Revoke the certificate so relying parties stop trusting the key pair",
      "Change the certificate authority's root key",
    ],
    x: "Key compromise demands immediate revocation, published via CRL/OCSP, so the compromised key pair is no longer trusted. A new key pair is then issued.",
  },
];

// ─── Fallback definition pool (used as distractors for generated questions) ──
export const FALLBACK_DEFS: { term: string; definition: string; domain: string }[] = [
  { domain: "1", term: "Audit risk", definition: "The risk that an auditor issues an incorrect opinion because material errors were not detected during the audit" },
  { domain: "1", term: "Substantive testing", definition: "Procedures that verify the accuracy, completeness, and validity of actual transactions and account balances" },
  { domain: "1", term: "Attribute sampling", definition: "A statistical method that estimates the rate of occurrence of a characteristic or exception in a population" },
  { domain: "1", term: "Control self-assessment", definition: "A facilitated process where business unit staff themselves evaluate the effectiveness of their controls and risks" },
  { domain: "2", term: "IT governance", definition: "The board and executive responsibility for ensuring IT supports business goals through value delivery and risk management" },
  { domain: "2", term: "Data owner", definition: "The business role accountable for classifying information and authorizing who can access it" },
  { domain: "2", term: "Service level agreement", definition: "A contract that defines measurable service performance targets, responsibilities, and remedies between provider and customer" },
  { domain: "2", term: "Compensating control", definition: "An alternative control put in place when the preferred control, such as segregation of duties, is not feasible" },
  { domain: "3", term: "Feasibility study", definition: "An early lifecycle analysis that determines whether a proposed system is viable technically, economically, legally, and operationally" },
  { domain: "3", term: "User acceptance testing", definition: "End-user testing that verifies the system meets business requirements under realistic operating conditions" },
  { domain: "3", term: "Critical path", definition: "The longest sequence of dependent project activities, which determines the minimum project duration" },
  { domain: "3", term: "Regression testing", definition: "Re-executing tests after changes to confirm that previously working functionality still works correctly" },
  { domain: "4", term: "Recovery time objective", definition: "The maximum tolerable time within which a process or system must be restored after a disruption" },
  { domain: "4", term: "Recovery point objective", definition: "The maximum tolerable data loss, expressed as a point in time to which data must be recoverable" },
  { domain: "4", term: "Hot site", definition: "A fully configured, continuously maintained alternate facility capable of near-immediate takeover of operations" },
  { domain: "4", term: "Business impact analysis", definition: "An assessment that quantifies financial and operational impact over time per process to derive recovery objectives" },
  { domain: "4", term: "Incremental backup", definition: "A backup that copies only data changed since the most recent backup of any type" },
  { domain: "5", term: "Asymmetric encryption", definition: "Encryption using a mathematically linked public and private key pair, supporting both confidentiality and digital signatures" },
  { domain: "5", term: "Crossover error rate", definition: "The biometric accuracy point where the false acceptance rate equals the false rejection rate" },
  { domain: "5", term: "Whaling", definition: "A targeted social engineering attack aimed specifically at senior executives of an organization" },
  { domain: "5", term: "Least privilege", definition: "The principle of granting users only the minimum access required to perform their assigned duties" },
  { domain: "5", term: "Mantrap", definition: "A double-door entry control that prevents tailgating by allowing only one person, verified, to pass at a time" },
];

// ─── Learning-science tips (rotated daily on the dashboard) ─────────────────
export const STUDY_TIPS: string[] = [
  "Spaced repetition beats cramming: reviewing flashcards 1, 6, then 15 days apart can double long-term retention.",
  "Testing yourself IS studying — retrieval practice strengthens memory far more than re-reading the same material.",
  "Interleave domains instead of blocking them. Mixing Domain 4 and Domain 5 questions feels harder but builds stronger discrimination.",
  "Explain a concept out loud in your own words. If you can't teach RTO vs RPO simply, you don't know it yet.",
  "Study in 25-minute pomodoros with real breaks. Attention decays fast; the break is when consolidation starts.",
  "Answer the question BEFORE reading the options. Generating the answer first reduces distractor interference.",
  "When you miss a question, write down WHY the wrong option tempted you. Error analysis prevents repeat mistakes.",
  "Review your hardest material first in a session, while cognitive resources are highest.",
  "Sleep is a study tool. Memory consolidation happens during deep sleep — protect the night before the exam.",
  "Confuse similar terms on purpose: put compliance vs substantive testing side by side and state the difference from memory.",
  "Don't re-read — recall. Close the tab and write down three things you remember about IT governance.",
  "Quiz yourself in exam mode regularly. Time pressure is a skill that must be trained, not hoped for.",
  "The CISA exam rewards the least/most/best answer — train yourself to read the whole stem before jumping at the first plausible option.",
  "Flashcard felt easy? Delay it. Felt hard? See it sooner. Difficulty-graded scheduling (SM-2) is built into your deck — trust it.",
  "A 20-question diagnostic on day one is a gift: it shows you exactly where the 40 hours should go.",
  "Alternate question difficulty: an easy win after a hard failure keeps productive struggle alive without burning out.",
  "Reading is passive. Key points land harder if you turn each one into a question and answer it from memory.",
  "Study the same concept again just before you would forget it — memory at the edge of retention strengthens the most.",
];
