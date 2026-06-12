// 전공 제도별 신청 조건 데이터
const majorRequirements = {
    doubleMajor: {
        name: '복수전공',
        minGPA: 3.0,
        minCredits: 36,
        minGrade: 2,
        description: '두 개 이상의 전공을 동시에 이수'
    },
    minor: {
        name: '부전공',
        minGPA: 2.5,
        minCredits: 30,
        minGrade: 1,
        description: '주전공 외에 추가 전공을 이수'
    },
    fusion: {
        name: '융합전공',
        minGPA: 2.8,
        minCredits: 33,
        minGrade: 2,
        description: '여러 학과의 과목을 조합하여 새로운 전공'
    },
    transfer: {
        name: '전과',
        minGPA: 3.5,
        minCredits: 40,
        minGrade: 3,
        description: '다른 학과로 주전공 변경'
    }
};

// 현재 학생 정보 저장
let currentStudentInfo = null;

// 화면 전환 함수
function showScreen(screenId) {
    // 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // 선택된 화면 표시
    document.getElementById(screenId).classList.add('active');
    // 페이지 상단으로 스크롤
    window.scrollTo(0, 0);
}

// 폼 제출 처리
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 학생 정보 수집
    currentStudentInfo = {
        studentId: document.getElementById('studentId').value,
        department: document.getElementById('department').value,
        grade: parseInt(document.getElementById('grade').value),
        gpa: parseFloat(document.getElementById('gpa').value),
        credits: parseInt(document.getElementById('credits').value)
    };
    
    // 결과 계산 및 표시
    displayResults();
    showScreen('resultScreen');
});

// 신청 가능 여부 확인
function checkEligibility(requirement) {
    if (!currentStudentInfo) return null;
    
    return {
        gpaOK: currentStudentInfo.gpa >= requirement.minGPA,
        creditsOK: currentStudentInfo.credits >= requirement.minCredits,
        gradeOK: currentStudentInfo.grade >= requirement.minGrade,
        isEligible: currentStudentInfo.gpa >= requirement.minGPA && 
                    currentStudentInfo.credits >= requirement.minCredits &&
                    currentStudentInfo.grade >= requirement.minGrade
    };
}

// 부족한 조건 계산
function calculateShortage(requirement) {
    if (!currentStudentInfo) return null;
    
    const shortage = {
        gpa: Math.max(0, requirement.minGPA - currentStudentInfo.gpa),
        credits: Math.max(0, requirement.minCredits - currentStudentInfo.credits),
        grade: Math.max(0, requirement.minGrade - currentStudentInfo.grade)
    };
    
    return shortage;
}

// 결과 화면 표시
function displayResults() {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';
    
    // 각 제도별 결과 표시
    Object.entries(majorRequirements).forEach(([key, requirement]) => {
        const eligibility = checkEligibility(requirement);
        const shortage = calculateShortage(requirement);
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `result-item ${eligibility.isEligible ? 'available' : 'unavailable'}`;
        
        let statusText = eligibility.isEligible ? '✅ 신청 가능' : '❌ 신청 불가';
        
        let conditionsList = `
            <ul class="condition-list">
                <li class="condition-item">
                    <span class="condition-icon ${eligibility.gpaOK ? 'met' : 'unmet'}">${eligibility.gpaOK ? '✓' : '✗'}</span>
                    <span class="condition-text">평점 조건: ${eligibility.gpaOK ? '충족' : '미충족'}</span>
                    <span class="condition-value">${currentStudentInfo.gpa.toFixed(2)} / ${requirement.minGPA}</span>
                </li>
                <li class="condition-item">
                    <span class="condition-icon ${eligibility.creditsOK ? 'met' : 'unmet'}">${eligibility.creditsOK ? '✓' : '✗'}</span>
                    <span class="condition-text">이수 학점 조건: ${eligibility.creditsOK ? '충족' : '미충족'}</span>
                    <span class="condition-value">${currentStudentInfo.credits} / ${requirement.minCredits}</span>
                </li>
                <li class="condition-item">
                    <span class="condition-icon ${eligibility.gradeOK ? 'met' : 'unmet'}">${eligibility.gradeOK ? '✓' : '✗'}</span>
                    <span class="condition-text">학년 조건: ${eligibility.gradeOK ? '충족' : '미충족'}</span>
                    <span class="condition-value">${currentStudentInfo.grade} / ${requirement.minGrade}</span>
                </li>
            </ul>
        `;
        
        let suggestionHTML = '';
        
        // 부족한 조건 안내
        if (!eligibility.isEligible) {
            let suggestions = [];
            
            if (shortage.gpa > 0) {
                suggestions.push(`평점 ${shortage.gpa.toFixed(1)}점 필요`);
            }
            if (shortage.credits > 0) {
                suggestions.push(`${shortage.credits}학점 추가 이수 필요`);
            }
            if (shortage.grade > 0) {
                suggestions.push(`${shortage.grade}학년 이상 필요`);
            }
            
            if (suggestions.length > 0) {
                suggestionHTML = `
                    <div class="suggestion">
                        <div class="suggestion-title">📌 개선 방향</div>
                        <div class="suggestion-text">${suggestions.join(' / ')}</div>
                    </div>
                `;
            }
        }
        
        resultDiv.innerHTML = `
            <h3>${requirement.name} ${statusText}</h3>
            <p style="color: #666; margin-bottom: 1rem;">${requirement.description}</p>
            ${conditionsList}
            ${suggestionHTML}
        `;
        
        resultContainer.appendChild(resultDiv);
    });
}

// 비교 테이블 생성
function displayComparisonTable() {
    const comparisonTable = document.getElementById('comparisonTable');
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>전공 제도</th>
                    <th>최소 평점</th>
                    <th>최소 학점</th>
                    <th>최소 학년</th>
                    <th>신청 가능 여부</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.entries(majorRequirements).forEach(([key, requirement]) => {
        const eligibility = checkEligibility(requirement);
        const statusBadge = eligibility.isEligible 
            ? '<span class="status-badge possible">🟢 가능</span>'
            : '<span class="status-badge impossible">🔴 불가능</span>';
        
        tableHTML += `
            <tr>
                <td><strong>${requirement.name}</strong></td>
                <td>${requirement.minGPA}</td>
                <td>${requirement.minCredits}학점</td>
                <td>${requirement.minGrade}학년</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    comparisonTable.innerHTML = tableHTML;
}

// 비교 버튼 클릭 시 테이블 생성
document.addEventListener('click', function(e) {
    if (e.target.textContent.includes('전공 비교하기')) {
        displayComparisonTable();
    }
});

// 페이지 로드 시 메인 화면 표시
document.addEventListener('DOMContentLoaded', function() {
    showScreen('mainScreen');
});