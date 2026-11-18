#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <cstdlib>
using namespace std;

struct Subject {
    string name;
    double units;
    double grade;
};

double getGrade(double percentage) {
    if (percentage > 100.0) percentage = 100.0;
    if (percentage < 0.0)   percentage = 0.0;

    if (percentage >= 97.6) {
        return 1.00;
    } else if (percentage >= 93.4) {
        return 1.25;
    } else if (percentage >= 90.1) {
        return 1.50;
    } else if (percentage >= 86.7) {
        return 1.75;
    } else if (percentage >= 83.6) {
        return 2.00;
    } else if (percentage >= 80.1) {
        return 2.25;
    } else if (percentage >= 76.7) {
        return 2.50;
    } else if (percentage >= 73.4) {
        return 2.75;
    } else if (percentage >= 70.0) {
        return 3.00;
    } else if (percentage >= 50.0) {
        return 4.00;
    } else {
        return 5.00;
    }
}

string getRemark(double grade) {
    if (grade <= 3.00) {
        return "Passed";
    } else if (grade == 4.00) {
        return "Conditional";
    } else {
        return "Failed";
    }
}

double computeGWA(const vector<Subject>& subjects) {
    if (subjects.empty()) {
        return 0.0;
    }

    double totalWeighted = 0.0;
    double totalUnits    = 0.0;

    for (int i = 0; i < (int)subjects.size(); i++) {
        totalWeighted = totalWeighted + (subjects[i].grade * subjects[i].units);
        totalUnits    = totalUnits + subjects[i].units;
    }

    if (totalUnits == 0.0) {
        return 0.0;
    }

    return totalWeighted / totalUnits;
}

string getLatinHonors(double gwa) {
    if (gwa == 0.0)  return "None";
    if (gwa <= 1.20) return "Summa Cum Laude";
    if (gwa <= 1.45) return "Magna Cum Laude";
    if (gwa <= 1.75) return "Cum Laude";
    return "No Latin Honors";
}

int main(int argc, char* argv[]) {
    cout << fixed << setprecision(2);

    if (argc >= 3 && string(argv[1]) == "grade") {
        double percentage = atof(argv[2]);
        double grade = getGrade(percentage);
        string remark = getRemark(grade);
        cout << grade << " " << remark << "\n";
        return 0;
    }

    if (argc >= 3 && string(argv[1]) == "gwa") {
        vector<Subject> subjects;
        int i = 2;
        while (i + 1 < argc) {
            Subject s;
            s.name  = "Subject";
            s.grade = atof(argv[i]);
            s.units = atof(argv[i + 1]);
            subjects.push_back(s);
            i = i + 2;
        }
        double gwa = computeGWA(subjects);
        string honors = getLatinHonors(gwa);
        cout << gwa << " " << honors << "\n";
        return 0;
    }

    cout << "========================================\n";
    cout << "  CvSU Grade & GWA Calculator (C++)\n";
    cout << "========================================\n\n";

    cout << "--- Transmutation Table Test ---\n";
    double testScores[] = {98, 95, 92, 89, 86, 83, 80, 77, 75, 72, 65};
    for (int i = 0; i < 11; i++) {
        double g = getGrade(testScores[i]);
        cout << "  " << testScores[i] << "%  →  Grade " << g
             << "  (" << getRemark(g) << ")\n";
    }

    cout << "\n--- GWA Test ---\n";
    vector<Subject> subjects;
    subjects.push_back({"IT 101", 3.0, 1.50});
    subjects.push_back({"Math 101", 3.0, 2.00});
    subjects.push_back({"PE 1", 2.0, 1.25});

    for (int i = 0; i < (int)subjects.size(); i++) {
        cout << "  " << subjects[i].name
             << "  Grade: " << subjects[i].grade
             << "  Units: " << subjects[i].units << "\n";
    }

    double gwa = computeGWA(subjects);
    cout << "\n  GWA = " << gwa << "\n";
    cout << "  Latin Honors: " << getLatinHonors(gwa) << "\n";
    cout << "\n========================================\n";
    return 0;
}
