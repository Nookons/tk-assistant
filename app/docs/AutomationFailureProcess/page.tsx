'use client'
import React from 'react';
import {AlertTriangle, Phone, Clock, Users, FileText, CheckCircle2, AlertCircle, MoveLeft} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import PagesHeader from "@/components/shared/PagesHeader";

const DocumentHeader = () => (
    <div className="border-b bg-gradient-to-br from-background to-muted/20 pb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Automation Equipment Failure Process
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Europe Operations Manual
                    </p>
                </div>
                <Badge variant="outline" className="text-sm px-4 py-2">
                    Version 2026.01-V1
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                <div>
                    <span className="text-muted-foreground">Prepared by:</span>
                    <p className="font-medium">PENGJU GAO</p>
                </div>
                <div>
                    <span className="text-muted-foreground">Reviewed by:</span>
                    <p className="font-medium">BUFENG LAN</p>
                </div>
            </div>
        </div>
    </div>
);

const SeverityBadge = ({level}: { level: string }) => {
    const variants: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", className: string }> = {
        P1: {variant: "destructive", className: "bg-red-500 border-red-500/20"},
        P2: {variant: "default", className: "bg-orange-500/10 text-orange-500 border-orange-500/20"},
        P3: {variant: "default", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"},
        P4: {variant: "outline", className: "bg-blue-500/10 text-blue-500 border-blue-500/20"},
    };

    const config = variants[level] || variants.P4;

    return (
        <Badge variant={config.variant} className={`font-mono font-bold ${config.className}`}>
            {level}
        </Badge>
    );
};

const SeverityMatrix = () => {
    const severityData = [
        {
            level: "P1",
            scope: "System-wide",
            impact: "Business interruption / Safety risk",
            businessImpact: "Core business completely interrupted, or safety / EHS / loss of control / fire linkage risks exist; WCS / RCS / core network / database unavailable",
            equipmentImpact: "Any type of HAI, GEEK, LIBIAO, KENGIC, JIACHENG equipment, where all equipment in a warehouse or region stops running for more than 60 minutes",
            duration: "≥60 min",
            rules: "One-vote escalation: safety issues or system-level critical service unavailability, regardless of duration"
        },
        {
            level: "P2",
            scope: "System-level or across multiple subsystems",
            impact: "Severe impact",
            businessImpact: "Business not fully interrupted, but throughput significantly reduced; key processes constrained; affects multiple areas or systems",
            equipmentImpact: "HAI & GEEK equipment taking >30 min to reach workstations; KENGIC/JIACHENG main conveyor congestion >30 min; >2/3 of LIBIAO platforms stalled >30 min",
            duration: "≥30 min",
            rules: "System-level propagation risk or core capabilities constrained; not judged by a single device failure"
        },
        {
            level: "P3",
            scope: "Local",
            impact: "Moderate impact",
            businessImpact: "Business can continue via rerouting or manual operations; throughput reduced but controllable",
            equipmentImpact: "Single GEEK & HAI workstation abnormal alarms >15 min; single LIBIAO platform offline >15 min; conveyor congestion >15 min",
            duration: "≥15 min",
            rules: "Limited impact scope, no system-level propagation"
        },
        {
            level: "P4",
            scope: "Single device or local",
            impact: "Minor impact",
            businessImpact: "Business impact <15 minutes, rapid recovery",
            equipmentImpact: "Routine failures <15 min",
            duration: "<15 min",
            rules: "All must be met: controllable impact scope, no safety risk, no system-level propagation"
        }
    ];

    return (
        <div className="space-y-4">
            {severityData.map((item) => (
                <Card key={item.level} className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-3">
                                <SeverityBadge level={item.level}/>
                                <span>{item.scope}</span>
                            </CardTitle>
                            <Badge variant="outline" className="font-mono">
                                {item.duration}
                            </Badge>
                        </div>
                        <CardDescription className="font-semibold text-foreground/80">
                            {item.impact}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Business Impact</p>
                            <p className="text-sm leading-relaxed">{item.businessImpact}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Equipment Impact</p>
                            <p className="text-sm leading-relaxed">{item.equipmentImpact}</p>
                        </div>
                        <div className="pt-2 border-t">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Key Rules</p>
                            <p className="text-sm leading-relaxed font-medium">{item.rules}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const ContactCard = ({region, name, phone, areas}: {
    region: string;
    name: string;
    phone: string;
    areas?: string
}) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Users size={18} className="text-primary"/>
                {region}
            </CardTitle>
            {areas && <CardDescription>{areas}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14}/>
                <a href={`tel:${phone}`} className="hover:text-foreground transition-colors">
                    {phone}
                </a>
            </div>
        </CardContent>
    </Card>
);

const Page = () => {
    const backHandle = () => {
        window.history.back()
    }
    return (
        <div className="min-h-screen bg-background">
            <PagesHeader/>
            <DocumentHeader/>

            <div className="max-w-7xl mx-auto px-4 py-8 pb-safe">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FileText size={24} className="text-primary"/>
                            Purpose & Scope
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Purpose</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed">
                                    This document describes the basic process of automation equipment failure handling
                                    and acceptance procedures.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Scope of Application</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">A. Automation Equipment</h4>
                                    <p className="text-sm text-muted-foreground">
                                        AMR/AGV, tote/bin robots, conveyor lines, sorting equipment, elevators/lifters
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">B. Automation Systems</h4>
                                    <p className="text-sm text-muted-foreground">
                                        WCS, RCS, PLC, equipment control systems
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">C. Supporting Infrastructure</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Servers, networks, charging systems
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <AlertCircle size={24} className="text-primary"/>
                            Key Definitions
                        </h2>

                        <Accordion type="single" collapsible className="space-y-3">
                            <AccordionItem value="hardware" className="border rounded-xl px-5 data-[state=open]:bg-accent/5">
                                <AccordionTrigger className="py-4 hover:no-underline">
                                    <span className="font-semibold">Equipment Hardware Failure</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <p className="text-sm leading-relaxed">
                                        Situations in which equipment is unable to perform its designed functions or
                                        experiences a significant decline in operational capability due to damage,
                                        degradation, or failure of physical components. Includes mechanical structure
                                        failures, electrical component failures, safety hardware failures, and
                                        energy-related failures.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="system" className="border rounded-xl px-5 data-[state=open]:bg-accent/5">
                                <AccordionTrigger className="py-4 hover:no-underline">
                                    <span className="font-semibold">Equipment System Failure</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <p className="text-sm leading-relaxed mb-3">
                                        Situations where equipment cannot operate according to expected logic due to
                                        abnormalities in control software, embedded systems, or higher-level systems
                                        (WCS/RCS).
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Control program crashes or firmware incompatibility</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>RCS/WCS service unavailability or task scheduling anomalies</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Communication system failures and network issues</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Data and interface problems with WMS integration</span>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="sla" className="border rounded-xl px-5 data-[state=open]:bg-accent/5">
                                <AccordionTrigger className="py-4 hover:no-underline">
                                    <span className="font-semibold">Service Level Agreement (SLA)</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <p className="text-sm leading-relaxed mb-3">
                                        Service quality, response time, recovery time, and responsibility boundaries
                                        agreed upon between equipment supplier or maintenance provider and SHEIN.
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0"/>
                                            <span>Equipment availability ≥97.5%, System availability 100%</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock size={16} className="text-blue-500 mt-0.5 shrink-0"/>
                                            <span>Hardware response ≤5 min, Software response ≤30 min</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Users size={16} className="text-purple-500 mt-0.5 shrink-0"/>
                                            <span>Personnel arrival on site ≤10 minutes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Phone size={16} className="text-orange-500 mt-0.5 shrink-0"/>
                                            <span>24/7 technical support</span>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Severity Classification */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle size={24} className="text-primary"/>
                            Failure Severity Classification
                        </h2>
                        <SeverityMatrix/>
                    </section>

                    {/* Response & Escalation */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Response & Escalation Procedures</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock size={20} className="text-orange-500"/>
                                        P4 → P3 Escalation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-1">No confirmation within 10 min</p>
                                            <p className="text-sm text-muted-foreground">
                                                Escalate from Maintenance Provider to On-site Engineer
                                            </p>
                                        </div>
                                    </div>
                                    <Separator/>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-1">No recovery after 30 min</p>
                                            <p className="text-sm text-muted-foreground">
                                                Team Leader upgrades and starts WarRoom
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertTriangle size={20} className="text-red-500"/>
                                        P1 → P2 Protocol
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-1">Immediate notification</p>
                                            <p className="text-sm text-muted-foreground">
                                                Notify WarRoom members and Engineering Director
                                            </p>
                                        </div>
                                    </div>
                                    <Separator/>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-1">24h recurrence</p>
                                            <p className="text-sm text-muted-foreground">
                                                Auto-escalate to WarRoom activation
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Emergency Contacts */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Phone size={24} className="text-primary"/>
                            Emergency Contacts
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">On-site Engineers</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <ContactCard
                                        region="Region A"
                                        name="Lukasz Papis"
                                        phone="+48 531 459 390"
                                        areas="DC1, DC2, DC3"
                                    />
                                    <ContactCard
                                        region="Region B & C"
                                        name="Tomasz Saj"
                                        phone="+48 537 623 301"
                                        areas="GLPC, SP3, PNTA"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Team Leaders</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <ContactCard
                                        region="Automation Maintenance Lead"
                                        name="Pengju Gao"
                                        phone="+48 571 525 708"
                                    />
                                    <ContactCard
                                        region="Engineering Director"
                                        name="Bufeng Lan"
                                        phone="+420 722 181 238"
                                    />
                                </div>
                            </div>

                            <Card className="border-amber-500/20 bg-amber-500/5">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-amber-500"/>
                                        Backup Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Artem Afanasienkov</p>
                                            <p className="text-sm text-muted-foreground">All Regions</p>
                                        </div>
                                        <a href="tel:+48530662870" className="text-sm hover:text-foreground transition-colors flex items-center gap-2">
                                            <Phone size={14}/>
                                            +48 530 662 870
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Process Flow */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Failure Management Process</h2>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {[
                                        {
                                            title: "1. Detection",
                                            description: "System alarms, maintenance inspections, or business feedback via Schat/WeCom/SIT"
                                        },
                                        {
                                            title: "2. Registration",
                                            description: "Log in SIT system with timestamp, affected areas, symptoms, and discoverer"
                                        },
                                        {
                                            title: "3. Classification",
                                            description: "Determine if it's an anomaly or failure, then assign severity level (P1-P4)"
                                        },
                                        {
                                            title: "4. Response & Resolution",
                                            description: "Activate emergency plan, isolate fault, identify root cause, execute repair"
                                        },
                                        {
                                            title: "5. Verification",
                                            description: "Confirm equipment functionality, system stability, and business metrics restored"
                                        },
                                        {
                                            title: "6. Closure",
                                            description: "Complete records, confirm stable operation, obtain approval from authorized personnel"
                                        },
                                        {
                                            title: "7. RCA & Improvement",
                                            description: "Conduct root cause analysis, implement CAPA, track prevention measures"
                                        }
                                    ].map((step, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary">
                                                    {index + 1}
                                                </div>
                                                {index < 6 && (
                                                    <div className="w-0.5 flex-1 bg-border min-h-8 mt-2 rounded-full"/>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <h4 className="font-semibold mb-1">{step.title}</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Page;